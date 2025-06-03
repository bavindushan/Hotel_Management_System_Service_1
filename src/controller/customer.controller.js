const { CustomerService } = require('../service/customer.service');
const { ValidationError } = require('../utils/AppError'); 

const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }

        if (!isValidEmail(email)) {
            throw new ValidationError("Invalid email format");
        }

        const result = await CustomerService.signIn({ email, password });

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            token: result.token || null,
        });
    } catch (err) {
        next(err);
    }
};

const signUp = async (req, res, next) => {
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            throw new ValidationError("Full name, email, and password are required");
        }

        if (!isValidEmail(email)) {
            throw new ValidationError("Invalid email format");
        }

        const result = await CustomerService.signUp({ full_name, email, password });

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    signIn,
    signUp,
};
