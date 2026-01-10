const bcrypt = require('bcrypt');
const generateToken = require("../utils/generateToken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ValidationError, NotFoundError, BadRequestError } = require('../utils/AppError');



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

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: "customer"
        });

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
                                room_type: {
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

    async addReservationPaymentDetails(data) {
        const {
            reservationId,
            cardType,
            cardNumber,
            cardExpMonth,
            cardExpYear,
            cvnCode
        } = data;

        // Validate required fields
        if (!reservationId || !cardType || !cardNumber || !cardExpMonth || !cardExpYear || !cvnCode) {
            throw new ValidationError('All fields are required.');
        }

        // Check if reservation exists
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!reservation) {
            throw new NotFoundError(`Reservation with ID ${reservationId} not found.`);
        }

        // Check if payment details already exist for this reservation
        const existing = await prisma.reservationpaymentdetails.findUnique({
            where: { reservation_id: reservationId }
        });

        if (existing) {
            throw new BadRequestError('Payment details for this reservation already exist.');
        }

        // Create payment details
        const paymentDetails = await prisma.reservationpaymentdetails.create({
            data: {
                reservation_id: reservationId,
                card_type: cardType,
                card_number: cardNumber,
                card_exp_month: cardExpMonth,
                card_exp_year: cardExpYear,
                cvn_code: cvnCode
            }
        });

        await prisma.reservation.update({
            where: { id: reservationId },
            data: { payment_status: 'Confirmed' }
        });

        await prisma.reservation.update({
            where: { id: reservationId },
            data: { reservation_status: 'Confirmed' }
        });

        return {
            success: true,
            statusCode: 201,
            message: 'Payment details added successfully.',
            data: paymentDetails
        };
    }

    async getOwnBillingDetails(customerId) {
        if (!customerId) {
            throw new NotFoundError('Customer ID not found in token.');
        }

        const billings = await prisma.billing.findMany({
            where: {
                reservation: {
                    customer_id: customerId
                }
            },
            include: {
                reservation: true
            }
        });

        if (!billings.length) {
            throw new NotFoundError('No billing records found for this customer.');
        }

        return {
            success: true,
            statusCode: 200,
            message: 'Billing records fetched successfully.',
            data: billings
        };
    }

    async getCustomerProfile(customerId) {
        if (!customerId) {
            throw new ValidationError("Customer ID is required");
        }

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                address: true,
                created_at: true,
            }
        });

        if (!customer) {
            throw new NotFoundError("Customer not found");
        }

        return {
            success: true,
            statusCode: 200,
            message: "Customer profile fetched successfully.",
            data: customer,
        };
    }

    async updateProfile(customerId, updateData) {
        const { full_name, phone, address, password } = updateData;

        // Check if customer exists
        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            throw new NotFoundError("Customer not found");
        }

        // Prepare update object
        const dataToUpdate = {};

        if (full_name) dataToUpdate.full_name = full_name;
        if (phone) dataToUpdate.phone = phone;
        if (address) dataToUpdate.address = address;
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            dataToUpdate.password_hash = hashed;
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: dataToUpdate,
        });

        return {
            success: true,
            statusCode: 200,
            message: "Customer profile updated successfully",
            data: {
                id: updatedCustomer.id,
                full_name: updatedCustomer.full_name,
                email: updatedCustomer.email,
                phone: updatedCustomer.phone,
                address: updatedCustomer.address,
            },
        };
    }

    async getAvailableRooms({ branch_id, check_in_date, check_out_date }) {
        // Validate branch existence
        const branch = await prisma.branch.findUnique({ where: { id: branch_id } });
        if (!branch) {
            throw new ValidationError("Invalid branch ID");
        }

        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);

        if (isNaN(checkIn) || isNaN(checkOut)) {
            throw new ValidationError("Invalid date format");
        }
        if (checkOut <= checkIn) {
            throw new ValidationError("Check-out date must be after check-in date");
        }

        // Find rooms in branch that are not booked during the period
        const bookedRooms = await prisma.bookedrooms.findMany({
            where: {
                reservation: {
                    check_in_date: { lt: checkOut },
                    check_out_date: { gt: checkIn },
                    reservation_status: { not: 'Cancelled' },
                }
            },
            select: {
                room_id: true
            }
        });

        const bookedRoomIds = bookedRooms.map(r => r.room_id);

        // Get available rooms in the branch excluding booked ones and with status Available
        const availableRooms = await prisma.room.findMany({
            where: {
                branch_id,
                status: 'Available',
                id: { notIn: bookedRoomIds }
            },
            include: {
                room_type: true
            }
        });

        return availableRooms.map(room => ({
            id: room.id,
            room_number: room.room_number,
            status: room.status,
            room_type: room.room_type?.type_name || null
        }));
    }

    async getReservationInvoice(reservationId) {
        const invoice = await prisma.billing.findUnique({
            where: { reservation_id: reservationId },
            select: {
                total_amount: true,
                tax_amount: true,
                other_charges: true,
                billing_date: true,
                status: true,
                reservation_id: true,
            }
        });

        if (!invoice) {
            return {
                success: false,
                statusCode: 404,
                message: `Invoice not found for reservation ID ${reservationId}`,
            };
        }

        return {
            success: true,
            statusCode: 200,
            data: {
                reservationId,
                billing: invoice
            }
        };
    }



}

module.exports = new CustomerService();
