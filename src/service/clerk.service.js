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

const getReservations = async (filters) => {
    const {
        customer,         // string to filter customer full_name or email (partial)
        status,           // reservation_status filter string
        check_in_start,   // date string filter start of check_in_date
        check_in_end,     // date string filter end of check_in_date
        page = 1,
        limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    // Build prisma where condition dynamically
    const where = {};

    if (status) {
        where.reservation_status = status;
    }

    if (check_in_start || check_in_end) {
        where.check_in_date = {};
        if (check_in_start) {
            where.check_in_date.gte = new Date(check_in_start);
        }
        if (check_in_end) {
            where.check_in_date.lte = new Date(check_in_end);
        }
    }

    if (customer) {
        where.customer = {
            OR: [
                { full_name: { contains: customer, mode: 'insensitive' } },
                { email: { contains: customer, mode: 'insensitive' } },
            ]
        };
    }

    // Query total count for pagination
    const totalCount = await prisma.reservation.count({ where });

    // Query paginated results
    const reservations = await prisma.reservation.findMany({
        where,
        include: {
            customer: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                }
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                }
            },
            bookedrooms: {
                include: {
                    room: {
                        select: {
                            id: true,
                            room_number: true,
                            status: true,
                            room_type_id: true,
                        }
                    }
                }
            }
        },
        orderBy: { check_in_date: 'desc' },
        skip,
        take: limit,
    });

    return {
        totalCount,
        page,
        limit,
        reservations,
    };
};

module.exports = {
    createReservation,
    getReservations,
};
