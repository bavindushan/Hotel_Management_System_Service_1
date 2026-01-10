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

/**
 * @swagger
 * /api/clerk/check-in:
 *   post:
 *     summary: Check-in customer and assign rooms
 *     description: Validates the reservation and updates the status to checked-in while marking rooms as occupied.
 *     tags: [Receptionist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Reservation ID to check-in
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *             properties:
 *               reservationId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Check-in successful
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
 *                   example: Customer checked in successfully
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Missing or invalid reservation ID or status not confirmed
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Internal server error
 */

router.post(
    '/check-in',
    authenticateRole(['Receptionist']),
    clerkController.checkIn
);

/**
 * @swagger
 * /api/clerk/check-out/{id}:
 *   post:
 *     summary: Check-out customer and finalize bill
 *     tags: [Receptionist]
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
 *         description: Check-out successful
 *       400:
 *         description: Reservation not checked-in
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */

router.post(
    '/check-out/:id',
    authenticateRole(['Receptionist']),
    clerkController.checkOutReservationHandler
);

/**
 * @swagger
 * /api/clerk/reservations/{id}/dates:
 *   patch:
 *     summary: Change reservation checkout date
 *     tags: [Receptionist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - check_out_date
 *             properties:
 *               check_out_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-15"
 *     responses:
 *       200:
 *         description: Checkout date updated successfully
 *       400:
 *         description: Invalid date or room not available
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */

router.patch(
    '/reservations/:id/dates',
    authenticateRole(['Receptionist']),
    clerkController.updateReservationDatesHandler
);

/**
 * @swagger
 * /api/clerk/reservations/{id}/charge:
 *   post:
 *     summary: Add optional charge to reservation
 *     tags: [Receptionist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1500
 *               description:
 *                 type: string
 *                 example: Laundry service
 *     responses:
 *       200:
 *         description: Optional charge added successfully
 *       400:
 *         description: Invalid charge amount
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */

router.post(
    '/reservations/:id/charge',
    authenticateRole(['Receptionist']),
    clerkController.addOptionalChargeHandler
);

/**
 * @swagger
 * /api/clerk/rooms/status:
 *   get:
 *     summary: View status of all physical rooms
 *     tags: [Receptionist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms with status
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
 *                         enum: [Available, Occupied, Maintenance]
 *                       price_per_night:
 *                         type: number
 *                       roomtype:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type_name:
 *                             type: string
 *                       branch:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

router.get(
    '/rooms/status',
    authenticateRole(['Receptionist']),
    clerkController.getRoomsStatusHandler
);




module.exports = router;
