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



module.exports = router;

