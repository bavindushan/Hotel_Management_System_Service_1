const managerReportService = require('../service/manager.service');

const getDailyOccupancyReportHandler = async (req, res, next) => {
    try {
        const { date, branch_id } = req.query;

        const report = await managerReportService.getDailyOccupancyReport({
            date,
            branch_id
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const getProjectedOccupancyReportHandler = async (req, res, next) => {
    try {
        const { from_date, to_date, branch_id } = req.query;

        const report = await managerReportService.getProjectedOccupancyReport({
            from_date,
            to_date,
            branch_id
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const getRevenueReportHandler = async (req, res, next) => {
    try {
        const { from_date, to_date, branch_id, groupBy } = req.query;

        const report = await managerReportService.getRevenueReport({
            from_date,
            to_date,
            branch_id,
            groupBy
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const getNoShowReportHandler = async (req, res, next) => {
    try {
        const { from_date, to_date, branch_id } = req.query;

        const report = await managerReportService.getNoShowReport({
            from_date,
            to_date,
            branch_id
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDailyOccupancyReportHandler,
    getProjectedOccupancyReportHandler,
    getRevenueReportHandler,
    getNoShowReportHandler,
};
