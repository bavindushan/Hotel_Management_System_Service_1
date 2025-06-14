const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const travelCompanyController = require('../controller/travelCompany.controller');
const authMiddleware = require('../middlewares/authMiddleware');


/**
 * @swagger
 * tags:
 *   name: TravelCompany
 *   description: Travel company registration and authentication
 */

/**
 * @swagger
 * /travelcompany/sign-up:
 *   post:
 *     summary: Register a new travel company
 *     tags: [TravelCompany]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - contact_person
 *               - email
 *               - phone
 *               - discount_rate
 *               - password
 *             properties:
 *               company_name:
 *                 type: string
 *                 example: "Global Travels"
 *               contact_person:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@globaltravels.com"
 *               phone:
 *                 type: string
 *                 example: "0712345678"
 *               discount_rate:
 *                 type: number
 *                 format: float
 *                 example: 10.50
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Travel company registered successfully
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
 *                   example: "Travel company registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     company_name:
 *                       type: string
 *                       example: "Global Travels"
 *                     email:
 *                       type: string
 *                       example: "contact@globaltravels.com"
 *       400:
 *         description: Validation or bad request error
 *       406:
 *         description: Validation error (missing or invalid fields)
 */
router.post('/sign-up', asyncHandler(travelCompanyController.signUp));

/**
 * @swagger
 * /travel-company/signin:
 *   post:
 *     summary: Travel company sign in
 *     tags: [TravelCompany]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: contact@globaltravels.com
 *               password:
 *                 type: string
 *                 example: yourpassword123
 *     responses:
 *       200:
 *         description: Sign-in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     company:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         company_name:
 *                           type: string
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized - invalid email or password
 */
router.post('/sign-in', asyncHandler(travelCompanyController.signIn));

/**
 * @swagger
 * /travel-company/reservations:
 *   post:
 *     summary: Create a blocked reservation for a travel company
 *     tags: [TravelCompany]
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
 *             required:
 *               - branchId
 *               - roomTypeId
 *               - startDate
 *               - endDate
 *               - numberOfRooms
 *             properties:
 *               branchId:
 *                 type: integer
 *                 example: 2
 *               roomTypeId:
 *                 type: integer
 *                 example: 3
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-08
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-06-10
 *               numberOfRooms:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Reservation created successfully.
 *                 data:
 *                   $ref: '#/components/schemas/BlockedBooking'
 */
router.post('/reservations', authMiddleware, asyncHandler(travelCompanyController.createReservation));

module.exports = router;

