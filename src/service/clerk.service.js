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

const checkInReservation = async (reservationId) => {
    // Validate reservation exists and status is Confirmed
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
            bookedrooms: true,
        }
    });

    if (!reservation) {
        throw new NotFoundError(`Reservation ID ${reservationId} not found`);
    }

    if (reservation.reservation_status !== 'Confirmed') {
        throw new ValidationError(`Reservation status must be 'Confirmed' to check-in`);
    }

    const roomIds = reservation.bookedrooms.map(br => br.room_id);

    // Update rooms status to Occupied
    await prisma.room.updateMany({
        where: { id: { in: roomIds } },
        data: { status: 'Occupied' },
    });

    // Update reservation status to Confirmed (or Checked_in if you updated the enum)
    const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: { reservation_status: 'Confirmed' },
    });

    return updatedReservation;
};

const checkOutReservation = async (reservationId) => {
    const reservation = await prisma.reservation.findUnique({
        where: { id: Number(reservationId) },
        include: {
            bookedrooms: {
                include: {
                    room: true
                }
            }
        }
    });

    if (!reservation) {
        throw new NotFoundError('Reservation not found');
    }

    if (reservation.reservation_status !== 'Confirmed') {
        throw new ValidationError('Reservation is not checked-in');
    }

    // Calculate nights
    const checkIn = new Date(reservation.check_in_date);
    const checkOut = new Date(reservation.check_out_date);
    const nights = Math.ceil(
        (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    let totalAmount = 0;

    reservation.bookedrooms.forEach(br => {
        totalAmount += br.room.price_per_night * nights;
    });

    const taxAmount = totalAmount * 0.1; // 10% tax
    const finalAmount = totalAmount + taxAmount;

    // Transaction
    await prisma.$transaction(async (tx) => {
        // Create billing
        await tx.billing.create({
            data: {
                reservation_id: reservation.id,
                total_amount: finalAmount,
                tax_amount: taxAmount,
                other_charges: 0,
                status: 'Paid',
            }
        });

        // Update rooms
        const roomIds = reservation.bookedrooms.map(br => br.room_id);
        await tx.room.updateMany({
            where: { id: { in: roomIds } },
            data: { status: 'Available' }
        });

        // Update reservation
        await tx.reservation.update({
            where: { id: reservation.id },
            data: {
                reservation_status: 'Completed',
                payment_status: 'Paid'
            }
        });
    });

    return {
        reservationId: reservation.id,
        nights,
        totalAmount: finalAmount
    };
};

const updateReservationDates = async (reservationId, newCheckOutDate) => {
    const reservation = await prisma.reservation.findUnique({
        where: { id: Number(reservationId) },
        include: {
            bookedrooms: true
        }
    });

    if (!reservation) {
        throw new NotFoundError('Reservation not found');
    }

    if (['Cancelled', 'Completed'].includes(reservation.reservation_status)) {
        throw new ValidationError('Cannot update dates for this reservation');
    }

    const newCheckout = new Date(newCheckOutDate);
    const currentCheckout = new Date(reservation.check_out_date);

    if (isNaN(newCheckout)) {
        throw new ValidationError('Invalid date format');
    }

    if (newCheckout <= currentCheckout) {
        throw new ValidationError('New checkout date must be after current checkout date');
    }

    // Check room availability for extension
    const roomIds = reservation.bookedrooms.map(br => br.room_id);

    const conflicts = await prisma.bookedrooms.findMany({
        where: {
            room_id: { in: roomIds },
            reservation: {
                id: { not: reservation.id },
                reservation_status: { not: 'Cancelled' },
                check_in_date: { lt: newCheckout },
                check_out_date: { gt: currentCheckout },
            }
        }
    });

    if (conflicts.length > 0) {
        throw new ValidationError('Rooms are not available for the extended dates');
    }

    // Update checkout date
    const updatedReservation = await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
            check_out_date: newCheckout
        }
    });

    return updatedReservation;
};

const addOptionalCharge = async (reservationId, chargeAmount, description) => {
    if (!chargeAmount || chargeAmount <= 0) {
        throw new ValidationError('Charge amount must be greater than zero');
    }

    const reservation = await prisma.reservation.findUnique({
        where: { id: Number(reservationId) },
        include: { billing: true }
    });

    if (!reservation) {
        throw new NotFoundError('Reservation not found');
    }

    if (reservation.reservation_status === 'Cancelled') {
        throw new ValidationError('Cannot add charges to a cancelled reservation');
    }

    // If billing does not exist, create it
    let billing = reservation.billing;

    if (!billing) {
        billing = await prisma.billing.create({
            data: {
                reservation_id: reservation.id,
                total_amount: chargeAmount,
                other_charges: chargeAmount,
                tax_amount: 0,
                status: 'Unpaid'
            }
        });
    } else {
        billing = await prisma.billing.update({
            where: { id: billing.id },
            data: {
                other_charges: billing.other_charges + chargeAmount,
                total_amount: billing.total_amount + chargeAmount
            }
        });
    }

    return {
        reservationId: reservation.id,
        addedCharge: chargeAmount,
        description,
        billing
    };
};

const getRoomsStatus = async () => {
    const rooms = await prisma.room.findMany({
        select: {
            id: true,
            room_number: true,
            status: true,
            price_per_night: true,
            roomtype: {
                select: {
                    id: true,
                    type_name: true
                }
            },
            branch: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            room_number: 'asc'
        }
    });

    return rooms;
};


module.exports = {
    createReservation,
    getReservations,
    checkInReservation,
    checkOutReservation,
    updateReservationDates,
    addOptionalCharge,
    getRoomsStatus,
};
