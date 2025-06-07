const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient, Prisma } = require('@prisma/client');
const { ValidationError } = require('../utils/AppError');

const prisma = new PrismaClient();

class CustomerService {
    async signIn({ email, password }) {
        const user = await prisma.customer.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return {
                success: false,
                message: 'Invalid credentials',
                statusCode: 401,
            };
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRIES || '1d' }
        );

        return {
            success: true,
            message: 'Sign in successful',
            token,
            statusCode: 200,
        };
    }

    async signUp({ full_name, email, phone, address, password }) {
        const existing = await prisma.customer.findUnique({ where: { email } });

        if (existing) {
            return {
                success: false,
                message: 'Email already in use',
                statusCode: 409,
            };
        }

        const password_hash = await bcrypt.hash(password, 10);

        await prisma.customer.create({
            data: {
                full_name,
                email,
                phone,
                address,
                password_hash,
            },
        });

        return {
            success: true,
            message: 'Customer registered successfully',
            statusCode: 201,
        };
    }

    async createReservation({
        customerId,
        branch_id,
        check_in_date,
        check_out_date,
        number_of_occupants,
        number_of_rooms,
        room_ids,
    }) {
        // Validate branch
        const branch = await prisma.branch.findUnique({ where: { id: branch_id } });
        if (!branch) throw new ValidationError("Invalid branch ID");

        // Fetch and validate rooms
        const rooms = await prisma.room.findMany({
            where: {
                id: { in: room_ids },
            },
        });
        if (rooms.length !== room_ids.length) {
            throw new ValidationError("Some rooms do not exist");
        }

        // Ensure all rooms belong to selected branch
        const invalidRooms = rooms.filter((room) => room.branch_id !== branch_id);
        if (invalidRooms.length > 0) {
            throw new ValidationError("Some rooms do not belong to the selected branch");
        }

        // Check for room conflicts
        const conflictingRooms = await prisma.bookedrooms.findMany({
            where: {
                room_id: { in: room_ids },
                reservation: {
                    is: {
                        check_in_date: { lt: new Date(check_out_date) },
                        check_out_date: { gt: new Date(check_in_date) },
                        reservation_status: { not: 'Cancelled' },
                    }
                }
            }
        });

        if (conflictingRooms.length > 0) {
            throw new ValidationError("One or more rooms are already booked for the selected dates");
        }

        // Create reservation + bookedRooms inside transaction
        const newReservation = await prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.create({
                data: {
                    customer_id: customerId,
                    branch_id,
                    check_in_date: new Date(check_in_date),
                    check_out_date: new Date(check_out_date),
                    number_of_occupants,
                    number_of_rooms,
                    payment_status: 'Pending',
                    reservation_status: 'No_show',

                },
            });

            // Create bookedRooms
            await tx.bookedrooms.createMany({
                data: room_ids.map((roomId) => ({
                    reservation_id: reservation.id,
                    room_id: roomId,
                })),
                skipDuplicates: true,
            });

            // Update rooms status to 'Occupied'
            await tx.room.updateMany({
                where: {
                    id: { in: room_ids },
                },
                data: {
                    status: 'Occupied',
                },
            });

            return reservation;
        });

        return newReservation;
    }

    async cancelReservation(reservationId) {
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                bookedrooms: true,
            },
        });

        if (!reservation) {
            throw new ValidationError("Reservation not found");
        }

        if (reservation.reservation_status === 'Cancelled') {
            throw new ValidationError("Reservation is already cancelled");
        }

        const roomIds = reservation.bookedrooms.map(br => br.room_id);

        // Cancel reservation and update room statuses
        await prisma.$transaction(async (tx) => {
            await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    reservation_status: 'Cancelled',
                },
            });

            await tx.room.updateMany({
                where: {
                    id: { in: roomIds },
                },
                data: {
                    status: 'Available',
                },
            });
        });

        return { message: "Reservation cancelled successfully" };
    }

    async completeReservation(reservationId) {
        const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
        if (!reservation) throw new NotFoundError("Reservation not found");

        if (reservation.reservation_status === "Cancelled") {
            throw new ValidationError("Cancelled reservations cannot be marked as complete");
        }

        if (reservation.payment_status !== "Paid") {
            throw new ValidationError("Only paid reservations can be marked as complete");

        }

        const updated = await prisma.reservation.update({
            where: { id: reservationId },
            data: { reservation_status: "Complete" },
        });

        return updated;
    }

    async getReservationsByCustomer(customerId) {
        const reservations = await prisma.reservation.findMany({
            where: { customer_id: customerId },
            include: {
                bookedrooms: {
                    include: {
                        room: {
                            select: {
                                room_number: true,
                                status: true,
                                roomtype: {
                                    select: { 
                                        type_name: true 
                                    }
                                }
                            }
                        }
                    }
                },
                branch: {
                    select: { 
                        name: true,
                        address: true 
                    }
                }
            },
            orderBy: { check_in_date: 'desc' }
        });

        return reservations;
    }

}

module.exports = new CustomerService();
