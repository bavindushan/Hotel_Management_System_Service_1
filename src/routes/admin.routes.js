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
    '/rooms',
    authenticateRole(['Admin', 'Manager']),
    adminRoomsController.addRoom
);

/**
 * @swagger
 * /api/admin/rooms/{id}:
 *   put:
 *     summary: Update room details or status
 *     description: Update fields such as status, price_per_night, room number, room_type_id, or branch_id for the specified room.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Room ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_number:
 *                 type: string
 *                 example: "102B"
 *               room_type_id:
 *                 type: integer
 *                 example: 2
 *               branch_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [Available, Occupied, Maintenance]
 *               price_per_night:
 *                 type: number
 *                 format: float
 *                 example: 120.00
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid input or no fields to update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */

router.put(
    '/rooms/:id',
    authenticateRole(['Admin', 'Manager']),
    adminRoomsController.updateRoom
);


module.exports = router;
