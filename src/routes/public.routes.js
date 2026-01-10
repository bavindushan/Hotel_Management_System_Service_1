const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const publicController = require('../controller/public.controller');

/**
 * @swagger
 * /public/rooms:
 *   get:
 *     summary: Get all room types with pricing and availability
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Room list fetched successfully
 */
router.get('/rooms', asyncHandler(publicController.getRooms));

/**
 * @swagger
 * /public/rooms/availability:
 *   get:
 *     summary: Check room availability
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: room_type_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: check_in_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: check_out_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Room availability fetched successfully
 */
router.get('/rooms/availability', asyncHandler(publicController.getRoomAvailability));


module.exports = router;
