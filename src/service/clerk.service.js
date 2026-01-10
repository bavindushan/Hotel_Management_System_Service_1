const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  AppError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require('../utils/AppError');  // Import all error classes

const createReservation = async (data) => {
    const {
        customer,        
        branch_id,
        check_in_date,
        check_out_date,
        number_of_occupants,
        room_type_id,
        number_of_rooms,
    } = data;

    // 1. Validate required fields
    if (!customer || !branch_id || !check_in_date || !check_out_date || !room_type_id || !number_of_rooms) {
        throw new BadRequestError('Missing required fields');
    }

    // 2. Validate check_in_date < check_out_date
    if (new Date(check_in_date) >= new Date(check_out_date)) {
        throw new BadRequestError('Check-out date must be after check-in date');
    }

    // 3. Find or create customer by email
    let customerRecord = await prisma.customer.findUnique({
        where: { email: customer.email }
    });

    if (!customerRecord) {
        customerRecord = await prisma.customer.create({
            data: {
                full_name: customer.full_name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
            },
        });
    }

    // 4. Check room availability for the given room_type, branch, and date range
    const candidateRooms = await prisma.room.findMany({
        where: {
            branch_id: branch_id,
            room_type_id: room_type_id,
            status: 'Available',
        },
    });

    if (candidateRooms.length < number_of_rooms) {
        throw new BadRequestError(`Not enough rooms available. Requested: ${number_of_rooms}, Available: ${candidateRooms.length}`);
    }

    // Filter rooms that are not booked in the requested period
    const availableRooms = [];

    for (const room of candidateRooms) {
        const overlappingBookings = await prisma.bookedrooms.findMany({
            where: {
                room_id: room.id,
                reservation: {
                    reservation_status: {
                        not: 'Cancelled'
                    },
                    OR: [
                        {
                            check_in_date: {
                                lte: new Date(check_out_date)
                            },
                            check_out_date: {
                                gte: new Date(check_in_date)
                            }
                        }
                    ]
                }
            }
        });

        if (overlappingBookings.length === 0) {
            availableRooms.push(room);
        }

        if (availableRooms.length === number_of_rooms) break;
    }

    if (availableRooms.length < number_of_rooms) {
        throw new BadRequestError(`Rooms not available for the selected dates`);
    }

    // 5. Create reservation
    const reservation = await prisma.reservation.create({
        data: {
            branch_id,
            customer_id: customerRecord.id,
            check_in_date: new Date(check_in_date),
            check_out_date: new Date(check_out_date),
            number_of_occupants,
            number_of_rooms,
            payment_status: 'Pending',
            reservation_status: 'Confirmed',
        },
    });

    // 6. Assign booked rooms (link rooms to reservation)
    const bookedRoomsData = availableRooms.map(room => ({
        reservation_id: reservation.id,
        room_id: room.id,
    }));

    await prisma.bookedrooms.createMany({
        data: bookedRoomsData,
    });

    return reservation;
};

module.exports = {
    createReservation,
};
