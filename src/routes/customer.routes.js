const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const authenticateToken = require('../middlewares/authMiddleware');
const customerController = require('../controller/customer.controller');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer management, signin and signup
 */


/**
 * @swagger
 * /customer/sign-in:
 *   post:
 *     summary: Customer sign in
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sign in successful
 */
router.post('/sign-in', asyncHandler(customerController.signIn));

/**
 * @swagger
 * /customer/sign-up:
 *   post:
 *     summary: Customer sign up
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 */
router.post('/sign-up', asyncHandler(customerController.signUp));

/**
 * @swagger
 * /customer/reservations:
 *   post:
 *     summary: Book a room
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *           example: Bearer <your_access_token>
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branch_id:
 *                 type: integer
 *               check_in_date:
 *                 type: string
 *                 format: date
 *               check_out_date:
 *                 type: string
 *                 format: date
 *               number_of_occupants:
 *                 type: integer
 *               number_of_rooms:
 *                 type: integer
 *               room_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Reservation created successfully
 */
router.post("/reservations", authMiddleware, asyncHandler(customerController.createReservation));

/**
 * @swagger
 * /customer/reservation/{id}/cancel:
 *   patch:
 *     summary: Cancel a reservation
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token
 *         schema:
 *           type: string
 *           example: Bearer <your_access_token>
 *       - in: path
 *         name: id
 *         required: true
 *         description: Reservation ID to cancel
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reservation cancelled successfully
 *       400:
 *         description: Invalid input or reservation already cancelled
 *       404:
 *         description: Reservation not found
 */
router.patch('/reservation/:id/cancel', authMiddleware, asyncHandler(customerController.cancelReservation));

/**
 * @swagger
 * /customer/reservation/{id}/complete:
 *   patch:
 *     summary: Mark reservation as Complete
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation marked as complete
 *       400:
 *         description: Invalid reservation ID
 *       404:
 *         description: Reservation not found
 */
router.patch("/reservation/:id/complete", authMiddleware, asyncHandler(customerController.completeReservation));

module.exports = router;
