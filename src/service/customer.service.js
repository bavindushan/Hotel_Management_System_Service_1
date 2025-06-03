const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppDataSource = require('../config/db');
const Customer = require('../entities/customer');

class CustomerService {
    constructor() {
        this.repo = null;
    }

    getRepository() {
        if (!this.repo) {
            if (!AppDataSource.isInitialized) {
                throw new Error('DataSource not initialized');
            }
            this.repo = AppDataSource.getRepository(Customer);
        }
        return this.repo;
    }

    async signIn({ email, password }) {
        const repo = this.getRepository();
        const user = await repo.findOneBy({ email });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return {
                success: false,
                message: 'Invalid credentials',
                statusCode: 401
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
            statusCode: 200
        };
    }

    async signUp({ full_name, email, password }) {
        const repo = this.getRepository();
        const existing = await repo.findOneBy({ email });

        if (existing) {
            return {
                success: false,
                message: 'Email already in use',
                statusCode: 409
            };
        }

        const password_hash = await bcrypt.hash(password, 10);
        const newCustomer = repo.create({ full_name, email, password_hash });

        await repo.save(newCustomer);

        return {
            success: true,
            message: 'Customer registered successfully',
            statusCode: 201
        };
    }
}

module.exports = new CustomerService();
