const bcrypt = require('bcrypt');
const generateToken = require("../utils/generateToken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { ValidationError, BadRequestError, UnauthorizedError } = require('../utils/AppError');
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

}

module.exports = new CustomerService();
