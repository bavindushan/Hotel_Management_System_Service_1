const travelCompanyService = require('../service/travelCompany.service');
const { ValidationError, UnauthorizedError } = require('../utils/AppError');
const { isValidEmail, isValidPhoneNumber } = require('../utils/emailAndPhoneValidations');

const signUp = async (req, res) => {
    const { company_name, contact_person, email, phone, discount_rate, password } = req.body;

    // Basic Required Field Validation
    if (!company_name || !contact_person || !email || !phone || !password) {
        throw new ValidationError('Required fields are missing');
    }

    // Email Format Validation
    if (!isValidEmail(email)) {
        throw new ValidationError('Invalid email format');
    }

    //  Phone Format Validation
    if (!isValidPhoneNumber(phone)) {
        throw new ValidationError('Phone number must be 10 digits and start with 0');
    }

    //  Optional: Check discount rate bounds
    if (discount_rate !== undefined && (discount_rate < 0 || discount_rate > 100)) {
        throw new ValidationError('Discount rate must be between 0 and 100');
    }

    const result = await travelCompanyService.registerTravelCompany({
        company_name, contact_person, email, phone, discount_rate, password
    });
    res.status(result.statusCode).json(result);
};

const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    const result = await travelCompanyService.signInTravelCompany({ email, password });
    res.status(result.statusCode || 200).json(result);
};

const createReservation = async (req, res) => {
    const companyId = req.user.companyId;
    //console.log("JWT token company id :- ",companyId);
    

    if (!companyId) {
        throw new UnauthorizedError('Invalid or missing company ID in token.');
    }

    // Merge companyId into request body
    const dataWithCompanyId = {
        ...req.body,
        companyId
    };
    
    const result = await travelCompanyService.createBlockedBooking(dataWithCompanyId);

    res.status(result.statusCode || 201).json({
        success: true,
        statusCode: result.statusCode || 201,
        message: result.message || 'Reservation created successfully.',
        data: result.data || null
    });
};

module.exports = {
    signUp,
    signIn,
    createReservation,
};