const express = require('express');
const router = express.Router();
const authenticateRole = require('..//middlewares/auth.middleware');
const clerkController = require('../controller/clerk.controller');

/**
 * @swagger
 * tags:
 *   - name: Clerk
 *     description: Receptionist (Clerk) management and endpoints
 */

/**
 * @swagger
 * /api/clerk/reservations:
 *   post:
 *     summary: Create reservation for customer
 *     description: Creates a new reservation with customer data, rooms, dates, and guests. Validates data and room availability.
 *     tags: [Clerk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - branch_id
 *               - check_in_date
 *               - check_out_date
 *               - number_of_occupants
 *               - room_type_id
 *               - number_of_rooms
 *             properties:
 *               customer:
 *                 type: object
 *                 required:
 *                   - full_name
 *                   - email
 *                 properties:
 *                   full_name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "john@example.com"
 *                   phone:
 *                     type: string
 *                     example: "1234567890"
 *                   address:
 *                     type: string
 *                     example: "123 Main St"
 *               branch_id:
 *                 type: integer
 *                 example: 1
 *               check_in_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-15"
 *               check_out_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-20"
 *               number_of_occupants:
 *                 type: integer
 *                 example: 2
 *               room_type_id:
 *                 type: integer
 *                 example: 3
 *               number_of_rooms:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Missing or invalid input data, or no rooms available
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

router.post(
    '/reservations',
    authenticateRole(['Receptionist']),
    clerkController.createReservation
);

/**
 * @swagger
 * /api/clerk/reservations:
 *   get:
 *     summary: Get all reservations with optional filters and pagination
 *     description: Retrieve a paginated list of reservations. Supports filtering by customer name/email, reservation status, and check-in date range.
 *     tags:
 *       - Clerk
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter reservations by customer full name or email (partial match)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Confirmed, Cancelled, No_show, Complete]
 *         description: Filter reservations by reservation status
 *       - in: query
 *         name: check_in_start
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter reservations with check-in date from this date (inclusive)
 *       - in: query
 *         name: check_in_end
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter reservations with check-in date up to this date (inclusive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of results per page for pagination
 *     responses:
 *       200:
 *         description: List of reservations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reservations fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     reservations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 123
 *                           branch_id:
 *                             type: integer
 *                             example: 2
 *                           customer_id:
 *                             type: integer
 *                             example: 45
 *                           check_in_date:
 *                             type: string
 *                             format: date
 *                             example: "2026-01-15"
 *                           check_out_date:
 *                             type: string
 *                             format: date
 *                             example: "2026-01-20"
 *                           number_of_occupants:
 *                             type: integer
 *                             example: 3
 *                           number_of_rooms:
 *                             type: integer
 *                             example: 1
 *                           payment_status:
 *                             type: string
 *                             example: Pending
 *                           reservation_status:
 *                             type: string
 *                             example: Confirmed
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           customer:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 45
 *                               full_name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               email:
 *                                 type: string
 *                                 example: "john@example.com"
 *                               phone:
 *                                 type: string
 *                                 example: "+123456789"
 *                           branch:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 2
 *                               name:
 *                                 type: string
 *                                 example: "Main Branch"
 *                               address:
 *                                 type: string
 *                                 example: "123 Street, City"
 *                           bookedrooms:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 789
 *                                 room:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       example: 10
 *                                     room_number:
 *                                       type: string
 *                                       example: "101A"
 *                                     status:
 *                                       type: string
 *                                       example: "Available"
 *                                     room_type_id:
 *                                       type: integer
 *                                       example: 1
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */

router.get(
    '/reservations',
    authenticateRole(['Receptionist']),
    clerkController.getReservations
);

module.exports = router;
