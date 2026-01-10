const bcrypt = require('bcrypt');
const generateToken = require("../utils/generateToken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { ValidationError, BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/AppError');
const { isValidEmail, isValidPhoneNumber } = require('../utils/emailAndPhoneValidations');

class CustomerService {
    async registerTravelCompany({ company_name, contact_person, email, phone, discount_rate, password }) {
        // Field validations
        if (!company_name || !contact_person || !email || !phone || !discount_rate || !password) {
            throw new ValidationError('All fields are required');
        }

        if (!isValidEmail(email)) {
            throw new ValidationError('Invalid email format');
        }

        if (!isValidPhoneNumber(phone)) {
            throw new ValidationError('Invalid phone number format');
        }

        // Check if email already exists
        const existingCompany = await prisma.travelcompany.findFirst({
            where: {
                email
            }
        });

        if (existingCompany) {
            throw new BadRequestError('A travel company with this email already exists');
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create new travel company
        const newCompany = await prisma.travelcompany.create({
            data: {
                company_name,
                contact_person,
                email,
                phone,
                discount_rate,
                password_hash,
            },
        });

        return {
            success: true,
            statusCode: 201,
            message: 'Travel company registered successfully',
            data: {
                id: newCompany.id,
                company_name: newCompany.company_name,
                email: newCompany.email,
            },
        };
    }
    async signInTravelCompany({ email, password }) {

        if (!isValidEmail(email)) {
            throw new ValidationError('Invalid email format');
        }

        // Check if the company exists
        const existingCompany = await prisma.travelcompany.findFirst({
            where: { email },
        });

        if (!existingCompany) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, existingCompany.password_hash);

        if (!isMatch) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const token = generateToken({ companyId: existingCompany.id, email: existingCompany.email });

        return {
            success: true,
            statusCode: 200,
            message: 'Sign-in successful',
            data: {
                token,
                company: {
                    id: existingCompany.id,
                    email: existingCompany.email,
                    company_name: existingCompany.company_name,
                },
            },
        };
    }

    async createBlockedBooking(data) {
        const {
            companyId,
            branchId,
            roomTypeId,
            startDate,
            endDate,
            numberOfRooms
        } = data;

        // Validate required fields
        if (!companyId || !branchId || !roomTypeId || !startDate || !endDate || !numberOfRooms) {
            throw new ValidationError('All fields (companyId, branchId, roomTypeId, startDate, endDate, numberOfRooms) are required.');
        }

        if (numberOfRooms <= 3) {
            throw new ValidationError('numberOfRooms must be grater than 3.');

        }

        if (isNaN(numberOfRooms) || numberOfRooms <= 0) {
            throw new ValidationError('numberOfRooms must be a positive number.');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ValidationError('Invalid startDate or endDate.');
        }

        if (start > end) {
            throw new ValidationError('startDate must be before or equal to endDate.');
        }

        // Check if company, branch, and room type exist
        const [company, branch, roomType] = await Promise.all([
            prisma.travelcompany.findFirst({ where: { id: companyId } }),
            prisma.branch.findFirst({ where: { id: branchId } }),
            prisma.roomtype.findFirst({ where: { id: roomTypeId } }),
        ]);

        if (!company) throw new NotFoundError(`Travel company with ID ${companyId} not found.`);
        if (!branch) throw new NotFoundError(`Branch with ID ${branchId} not found.`);
        if (!roomType) throw new NotFoundError(`Room type with ID ${roomTypeId} not found.`);

        // Fetch available rooms
        const availableRooms = await prisma.room.findMany({
            where: {
                branch_id: branchId,
                room_type_id: roomTypeId,
                status: 'Available'
            },
            take: numberOfRooms
        });

        if (availableRooms.length < numberOfRooms) {
            throw new BadRequestError(`Only ${availableRooms.length} room(s) available, but ${numberOfRooms} requested.`);
        }

        // Create blocked booking
        const blockedBooking = await prisma.blockedbooking.create({
            data: {
                company_id: companyId,
                branch_id: branchId,
                room_type_id: roomTypeId,
                start_date: start,
                end_date: end,
                number_of_rooms: numberOfRooms,
            }
        });

        // Link rooms to blocked booking
        const bookingRoomsData = availableRooms.map(room => ({
            blocked_booking_id: blockedBooking.id,
            room_id: room.id
        }));

        await prisma.blockedbookingrooms.createMany({
            data: bookingRoomsData
        });

        // Set status of rooms to "OCCUPIED"
        await Promise.all(
            availableRooms.map(room =>
                prisma.room.update({
                    where: { id: room.id },
                    data: { status: 'OCCUPIED' }
                })
            )
        );

        return {
            success: true,
            statusCode: 201,
            message: 'Reservation created successfully.',
            data: blockedBooking
        };
    }

    async getBlockedBookingsByCompanyId(companyId) {
        if (!companyId || isNaN(companyId)) {
            throw new ValidationError('Invalid company ID.');
        }

        const reservations = await prisma.blockedbooking.findMany({
            where: {
                company_id: companyId
            },
            include: {
                roomtype: true,
                branch: true,
                blockedbookingrooms: {
                    include: {
                        room: true
                    }
                }
            }
        });

        return {
            success: true,
            statusCode: 200,
            message: 'Reservations fetched successfully.',
            data: reservations
        };
    }

    async getOwnBillDetails(companyId) {
        if (!companyId) {
            throw new NotFoundError('Company ID not found in token.');
        }

        const billings = await prisma.travelcompanybill.findMany({
            where: {
                blockedbooking: {
                    company_id: companyId
                }
            },
            include: {
                blockedbooking: true
            }
        });

        if (!billings.length) {
            throw new NotFoundError('No billing records found for this travel company.');
        }

        return {
            success: true,
            statusCode: 200,
            message: 'Travel company billing records fetched successfully.',
            data: billings
        };
    }

    async getProfile(companyId) {
        const company = await prisma.travelcompany.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                company_name: true,
                contact_person: true,
                email: true,
                phone: true,
                discount_rate: true,
            },
        });

        if (!company) {
            throw new NotFoundError("Travel company profile not found");
        }

        return {
            success: true,
            statusCode: 200,
            data: company,
            message: "Travel company profile fetched successfully",
        };
    }

    async updateProfile(companyId, updateData) {

        // if (!isValidEmail(updateData.email)) {
        //     throw new ValidationError('Invalid email format');
        // }

        // if (!isValidPhoneNumber(updateData.phone)) {
        //     throw new ValidationError('Invalid phone number format');
        // }

        const updatedCompany = await prisma.travelcompany.update({
            where: { id: companyId },
            data: updateData,
            select: {
                id: true,
                company_name: true,
                contact_person: true,
                email: true,
                phone: true,
                discount_rate: true,
            },
        });

        if (!updatedCompany) {
            throw new NotFoundError("Travel company profile not found");
        }

        return {
            success: true,
            statusCode: 200,
            data: updatedCompany,
            message: "Travel company profile updated successfully",
        };
    }

    async cancelReservation(reservationId, companyId) {
        // Check if blocked booking exists and belongs to the travel company
        const reservation = await prisma.blockedbooking.findUnique({
            where: { id: reservationId },
            include: {
                blockedbookingrooms: true,
            },
        });

        if (!reservation) {
            throw new NotFoundError('Reservation not found.');
        }

        if (reservation.company_id !== companyId) {
            throw new UnauthorizedError(
                'You do not have permission to cancel this reservation.'
            );
        }

        //  Prevent cancelling past reservations
        if (reservation.end_date && reservation.end_date < new Date()) {
            throw new BadRequestError(
                'Cannot cancel a reservation that has already ended.'
            );
        }

        // Remove blocked rooms first (FK safety)
        await prisma.blockedbookingrooms.deleteMany({
            where: {
                blocked_booking_id: reservationId,
            },
        });

        //  Delete blocked booking (actual cancellation)
        await prisma.blockedbooking.delete({
            where: { id: reservationId },
        });

        return {
            success: true,
            statusCode: 200,
            message: 'Reservation cancelled successfully.',
            data: {
                reservationId,
            },
        };
    }



}

module.exports = new CustomerService();
