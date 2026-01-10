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

module.exports = {
    createReservation,
};
