const express = require('express');
const router = express.Router();
const managerReportController = require('../controller/manager.controller');
const authenticateRole = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Manager 
 *     description: Manager management and endpoints
 */

/**
 * @swagger
 * /api/manager/reports/occupancy/daily:
 *   get:
 *     summary: Daily Occupancy Report
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for occupancy calculation (default today)
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
 */

router.get(
    '/reports/occupancy/daily',
    authenticateRole(['Manager']),
    managerReportController.getDailyOccupancyReportHandler
);

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
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
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
 */

router.get(
    '/reports/occupancy/projected',
    authenticateRole(['Manager']),
    managerReportController.getProjectedOccupancyReportHandler
);

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
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [daily, monthly]
 *     responses:
 *       200:
 *         description: Revenue summary
 */

router.get(
    '/reports/revenue',
    authenticateRole(['Manager']),
    managerReportController.getRevenueReportHandler
);

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
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of no-show reservations
 */

router.get(
    '/reports/no-shows',
    authenticateRole(['Manager']),
    managerReportController.getNoShowReportHandler
);




module.exports = router;
