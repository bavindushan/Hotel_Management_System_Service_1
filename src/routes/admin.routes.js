const express = require('express');
const router = express.Router();
const authenticateRole = require('../middlewares/auth.middleware');
const adminController = require('../controller/admin.controller');

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
 */

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

/**
 * @swagger
 * /api/admin/room-types:
 *   post:
 *     summary: Create a new room type with base price
 *     description: Define room types with a unique type_name, optional description, and base price.
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
 *               - type_name
 *               - base_price
 *             properties:
 *               type_name:
 *                 type: string
 *                 example: Deluxe
 *                 description: Unique name of the room type
 *               description:
 *                 type: string
 *                 example: A deluxe room with sea view
 *                 description: Optional description of the room type
 *               base_price:
 *                 type: number
 *                 format: float
 *                 example: 200.00
 *                 description: Base price for this room type
 *     responses:
 *       201:
 *         description: Room type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomType'
 *       400:
 *         description: Missing required fields or validation error
 *         content:
 *           application/json:
 *             example:
 *               message: "type_name and base_price are required"
 *       409:
 *         description: Conflict - room type with this name already exists
 *         content:
 *           application/json:
 *             example:
 *               message: "Room type with type_name 'Deluxe' already exists"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions or invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a staff user account
 *     description: Create staff accounts with username, email, password, role, and optional branch.
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
 *               - username
 *               - email
 *               - password
 *               - role_id
 *             properties:
 *               username:
 *                 type: string
 *                 example: receptionist1
 *               email:
 *                 type: string
 *                 format: email
 *                 example: receptionist@example.com
 *               password:
 *                 type: string
 *                 example: Passw0rd!
 *               role_id:
 *                 type: integer
 *                 example: 2
 *                 description: Role ID must exist
 *               branch_id:
 *                 type: integer
 *                 example: 1
 *                 description: Optional branch ID
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role_id:
 *                   type: integer
 *                 branch_id:
 *                   type: integer
 *                   nullable: true
 *       400:
 *         description: Validation error or missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get list of system users
 *     description: Retrieve system users with optional filters and pagination, including role and branch info.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         description: Filter by role ID
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *         description: Filter by branch ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email (case-insensitive)
 *     responses:
 *       200:
 *         description: List of users with roles and branches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       username:
 *                         type: string
 *                         example: receptionist1
 *                       email:
 *                         type: string
 *                         example: receptionist1@example.com
 *                       role_id:
 *                         type: integer
 *                         example: 2
 *                       branch_id:
 *                         type: integer
 *                         nullable: true
 *                       role:
 *                         type: object
 *                         properties:
 *                           role_id:
 *                             type: integer
 *                             example: 2
 *                           role_name:
 *                             type: string
 *                             example: Receptionist
 *                       branch:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: Main Branch
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

router.post('/rooms', authenticateRole(['Admin', 'Manager']), adminController.addRoom);
router.put('/rooms/:id', authenticateRole(['Admin', 'Manager']), adminController.updateRoom);
router.post('/room-types', authenticateRole(['Admin', 'Manager']), adminController.addRoomType);
router.post('/users', authenticateRole(['Admin']), adminController.createUser);
router.get('/users', authenticateRole(['Admin']), adminController.getUsers);

module.exports = router;
