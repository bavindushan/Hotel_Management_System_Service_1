const express = require('express');
const router = express.Router();
const authenticateRole = require('../middlewares/auth.middleware');
const adminRoomsController = require('../controller/admin.controller');

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management and endpoints
 */

/**
 * @swagger
 * /api/admin/rooms:
 *   post:
 *     summary: Add a new physical room
 *     description: Creates a new physical room with room number, type, branch, status, and optional price per night.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_number
 *               - room_type_id
 *               - branch_id
 *             properties:
 *               room_number:
 *                 type: string
 *                 example: "101A"
 *                 description: Unique room number or identifier
 *               room_type_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the room type (must exist)
 *               branch_id:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the branch (must exist)
 *               status:
 *                 type: string
 *                 enum: [Available, Occupied, Maintenance]
 *                 default: Available
 *                 description: Status of the room
 *               price_per_night:
 *                 type: number
 *                 format: float
 *                 example: 100.50
 *                 description: Optional price per night
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Missing required fields or validation error
 *         content:
 *           application/json:
 *             example:
 *               message: "room_number, room_type_id and branch_id are required"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions or invalid token
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         room_number:
 *           type: string
 *           example: "101A"
 *         room_type_id:
 *           type: integer
 *           example: 1
 *         branch_id:
 *           type: integer
 *           example: 2
 *         status:
 *           type: string
 *           enum: [Available, Occupied, Maintenance]
 *           example: Available
 *         price_per_night:
 *           type: number
 *           format: float
 *           example: 100.50
 */

router.post(
    '/',
    authenticateRole(['admin', 'manager']),
    adminRoomsController.addRoom
);

module.exports = router;
