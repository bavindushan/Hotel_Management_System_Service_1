const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
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

/**
 * @swagger
 * /customer/reservations/my:
 *   get:
 *     summary: Get own reservations
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
 *     responses:
 *       200:
 *         description: List of reservations for the logged-in customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/reservations/my", authMiddleware, asyncHandler(customerController.getMyReservations));

/**
 * @swagger
 * /customer/reservation/payment-details:
 *   post:
 *     summary: Add payment details for a reservation
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - cardType
 *               - cardNumber
 *               - cardExpMonth
 *               - cardExpYear
 *               - cvnCode
 *             properties:
 *               reservationId:
 *                 type: integer
 *               cardType:
 *                 type: string
 *               cardNumber:
 *                 type: string
 *               cardExpMonth:
 *                 type: string
 *               cardExpYear:
 *                 type: string
 *               cvnCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment details added successfully
 */
router.post('/reservation/payment-details',authMiddleware,asyncHandler(customerController.addReservationPaymentDetails));

/**
 * @swagger
 * /customer/billing:
 *   get:
 *     summary: Get own billing details
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Billing records fetched successfully.
 *       404:
 *         description: No billing records found.
 */
router.get('/billing', authMiddleware, asyncHandler(customerController.getOwnBilling));

/**
 * @swagger
 * /customer/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     full_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 */
router.get('/profile', authMiddleware, asyncHandler(customerController.getCustomerProfile));

/**
 * @swagger
 * /customer/profile:
 *   put:
 *     summary: Update logged-in customer's profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               full_name: John Doe
 *               phone: "0712345678"
 *               address: "123, Main Street"
 *               password: "newpassword123"
 *     responses:
 *       200:
 *         description: Customer profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authMiddleware, asyncHandler(customerController.updateProfile));

/**
 * @swagger
 * /customer/rooms/availability:
 *   get:
 *     summary: Get available rooms for given branch and dates
 *     tags: [Customer]
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Branch ID to check rooms availability
 *       - in: query
 *         name: check_in_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Check-in date
 *       - in: query
 *         name: check_out_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Check-out date
 *     responses:
 *       200:
 *         description: List of available rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       room_number:
 *                         type: string
 *                       status:
 *                         type: string
 *                       room_type:
 *                         type: string
 */
router.get('/rooms/availability', authMiddleware, asyncHandler(customerController.getAvailableRooms));

/**
 * @swagger
 * /customer/reservations/{id}/invoice:
 *   get:
 *     summary: Get invoice details for a reservation
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Reservation ID to fetch invoice for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     reservationId:
 *                       type: integer
 *                     billing:
 *                       type: object
 *                       properties:
 *                         total_amount:
 *                           type: number
 *                         tax_amount:
 *                           type: number
 *                         other_charges:
 *                           type: number
 *                         billing_date:
 *                           type: string
 *                           format: date
 *                         status:
 *                           type: string
 *       404:
 *         description: Invoice not found
 */
router.get('/reservations/:id/invoice', authMiddleware, asyncHandler(customerController.getReservationInvoice));


module.exports = router;
