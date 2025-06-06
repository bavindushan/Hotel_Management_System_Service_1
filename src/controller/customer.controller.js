const CustomerService = require('../service/customer.service');
const { ValidationError } = require('../utils/AppError');

const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const isValidPhoneNumber = (phone) => {
    const regex = /^0\d{9}$/;
    return regex.test(phone);
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
        const { full_name, email, phone, address, password } = req.body;

        if (!full_name || !email || !password || !phone || !address) {
            throw new ValidationError("Full name, email, and password are required");
        }

        if (!isValidEmail(email)) {
            throw new ValidationError("Invalid email format");
        }

        if (!isValidPhoneNumber(phone)) {
            throw new ValidationError("Invalid phone number format");
        }

        const result = await CustomerService.signUp({ full_name, email, phone, address, password });

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
        });
    } catch (err) {
        next(err);
    }
};


const createReservation = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        console.log("Customer id from token:", customerId);

        const {
            branch_id,
            check_in_date,
            check_out_date,
            number_of_occupants,
            number_of_rooms,
            room_ids
        } = req.body;

        if (
            !branch_id ||
            !check_in_date ||
            !check_out_date ||
            !number_of_occupants ||
            !number_of_rooms ||
            !Array.isArray(room_ids) ||
            room_ids.length === 0
        ) {
            throw new ValidationError("All fields including a non-empty list of room_ids are required");
        }

        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);

        if (isNaN(checkIn) || isNaN(checkOut)) {
            throw new ValidationError("Invalid check-in or check-out date format");
        }

        if (new Date(check_out_date) <= new Date(check_in_date)) {
            throw new ValidationError("Check-out date must be after check-in date");
        }

        if (number_of_occupants <= 0 || number_of_rooms <= 0) {
            throw new ValidationError("Number of occupants and rooms must be greater than zero");
        }

        const reservationResult = await CustomerService.createReservation({
            customerId,
            branch_id,
            check_in_date,
            check_out_date,
            number_of_occupants,
            number_of_rooms,
            room_ids
        });

        res.status(reservationResult.statusCode || 201).json({
            success: reservationResult.success ?? true,
            message: reservationResult.message ?? "Reservation created successfully",
            data: reservationResult.data ?? reservationResult
        });

    } catch (err) {
        next(err);
    }
};

const cancelReservation = async (req, res) => {
    const { id } = req.params;
    const result = await CustomerService.cancelReservation(parseInt(id));
    res.status(200).json(result);
};

const completeReservation = async (req, res) => {
    const reservationId = parseInt(req.params.id);
    if (isNaN(reservationId)) {
        return res.status(400).json({ message: "Invalid reservation ID" });
    }

    const updatedReservation = await CustomerService.completeReservation(reservationId);
    res.status(200).json({ message: "Reservation marked as complete", data: updatedReservation });
};


module.exports = {
    signIn,
    signUp,
    createReservation,
    cancelReservation,
    completeReservation,
};
