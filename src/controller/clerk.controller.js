const clerkService = require('../service/clerk.service');

const createReservation = async (req, res, next) => {
    try {
        const reservationData = req.body;
        const newReservation = await clerkService.createReservation(reservationData);
        res.status(201).json({ success: true, data: newReservation });
    } catch (error) {
        next(error);
    }
};

const getReservations = async (req, res, next) => {
    try {
        const {
            customer,
            status,
            check_in_start,
            check_in_end,
            page,
            limit,
        } = req.query;

        const data = await clerkService.getReservations({
            customer,
            status,
            check_in_start,
            check_in_end,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });

        res.status(200).json({
            success: true,
            message: 'Reservations fetched successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

const checkIn  = async (req, res, next) => {
    try {
        const { reservationId } = req.body;

        if (!reservationId) {
            return res.status(400).json({ success: false, message: "reservationId is required" });
        }

        const result = await clerkService.checkInReservation(reservationId);

        res.status(200).json({
            success: true,
            message: "Customer checked in successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const checkOutReservationHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await clerkService.checkOutReservation(id);

        res.status(200).json({
            success: true,
            message: 'Customer checked out successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateReservationDatesHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { check_out_date } = req.body;

        if (!check_out_date) {
            return res.status(400).json({
                success: false,
                message: 'check_out_date is required'
            });
        }

        const result = await clerkService.updateReservationDates(id, check_out_date);

        res.status(200).json({
            success: true,
            message: 'Checkout date updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const addOptionalChargeHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, description } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'amount is required'
            });
        }

        const result = await clerkService.addOptionalCharge(id, amount, description);

        res.status(200).json({
            success: true,
            message: 'Optional charge added successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getRoomsStatusHandler = async (req, res, next) => {
    try {
        const rooms = await clerkService.getRoomsStatus();

        res.status(200).json({
            success: true,
            message: 'Room status fetched successfully',
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReservation,
    getReservations,
    checkIn,
    checkOutReservationHandler,
    updateReservationDatesHandler,
    addOptionalChargeHandler,
    getRoomsStatusHandler,
};
