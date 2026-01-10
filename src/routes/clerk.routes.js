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

module.exports = router;
