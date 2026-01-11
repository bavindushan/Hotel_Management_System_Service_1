const express = require('express');
const router = express.Router();
const managerReportController = require('../controller/manager.controller');
const authenticateRole = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Manager Reports
 *     description: Manager report generation endpoints
 */

/**
 * @swagger
 * /api/manager/reports/occupancy/daily:
 *   get:
 *     summary: Daily Occupancy Report
 *     tags: [Manager Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 'Date for occupancy calculation (default: today)'
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *         description: Branch ID (optional)
 *     responses:
 *       200:
 *         description: Daily occupancy report
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 date: "2026-01-11"
 *                 total_rooms: 120
 *                 occupied_rooms: 86
 *                 available_rooms: 34
 */

/**
 * @swagger
 * /api/manager/reports/occupancy/projected:
 *   get:
 *     summary: Projected Occupancy Report
 *     tags: [Manager Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for projection
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for projection
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *         description: Branch ID (optional)
 *     responses:
 *       200:
 *         description: Projected occupancy per day
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - date: "2026-01-15"
 *                   occupied_rooms: 90
 *                   available_rooms: 30
 *                 - date: "2026-01-16"
 *                   occupied_rooms: 88
 *                   available_rooms: 32
 */

/**
 * @swagger
 * /api/manager/reports/revenue:
 *   get:
 *     summary: Revenue Report
 *     tags: [Manager Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for revenue report
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for revenue report
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *         description: Branch ID (optional)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [daily, monthly]
 *         description: Group revenue data by day or month
 *     responses:
 *       200:
 *         description: Revenue summary report
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 total_revenue: 1250000.00
 *                 tax: 125000.00
 *                 other_charges: 50000.00
 *                 paid_reservations: 92
 *                 unpaid_reservations: 8
 */

/**
 * @swagger
 * /api/manager/reports/no-shows:
 *   get:
 *     summary: No-Show Report
 *     tags: [Manager Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date to filter no-shows
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date to filter no-shows
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *         description: Branch ID (optional)
 *     responses:
 *       200:
 *         description: List of no-show reservations
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - reservation_id: 101
 *                   customer: "John Silva"
 *                   check_in_date: "2026-01-10"
 *                   rooms: 2
 *                   branch: "Colombo"
 *                 - reservation_id: 102
 *                   customer: "Jane Doe"
 *                   check_in_date: "2026-01-11"
 *                   rooms: 1
 *                   branch: "Colombo"
 */

router.get(
    '/reports/occupancy/daily',
    authenticateRole(['Manager']),
    managerReportController.getDailyOccupancyReportHandler
);

router.get(
    '/reports/occupancy/projected',
    authenticateRole(['Manager']),
    managerReportController.getProjectedOccupancyReportHandler
);

router.get(
    '/reports/revenue',
    authenticateRole(['Manager']),
    managerReportController.getRevenueReportHandler
);

router.get(
    '/reports/no-shows',
    authenticateRole(['Manager']),
    managerReportController.getNoShowReportHandler
);

module.exports = router;
