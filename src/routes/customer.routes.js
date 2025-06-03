const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const authenticateToken = require('../middlewares/authMiddleware');
const customerController = require('../controller/customer.controller');


/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer management, signin and signup
 */

/**
 * @swagger
 * /api/customer/sign-in:
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
 * /api/customer/sign-up:
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
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 */
router.post('/sign-up', asyncHandler(customerController.signUp));

// Protected route
//router.get('/', authenticateToken, asyncHandler(customerController.getCustomers));

module.exports = router;
