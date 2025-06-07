const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { ValidationError, BadRequestError } = require('../utils/AppError');
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
}

module.exports = new CustomerService();
