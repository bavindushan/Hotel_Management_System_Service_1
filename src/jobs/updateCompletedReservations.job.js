const cron = require('node-cron');
const prisma = require('../config/prismaClient');

const updateCompletedReservations = async () => {
    try {
        const today = new Date();

        const updated = await prisma.reservation.updateMany({
            where: {
                check_out_date: {
                    lt: today,
                },
                reservation_status: {
                    not: 'Cancelled',
                },
            },
            data: {
                reservation_status: 'Complete',
            },
        });

        console.log(`[CRON] Completed reservations updated: ${updated.count}`);
    } catch (error) {
        console.error('[CRON ERROR] Updating completed reservations failed:', error);
    }
};

// Runs every day at 00:00 (12:00 AM)
cron.schedule('0 0 * * *', updateCompletedReservations);