const cron = require('node-cron');
const prisma = require('../config/prismaClient');

const cancelUnpaidReservations = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const now = new Date();

        const unpaidReservations = await prisma.reservation.findMany({
            where: {
                payment_status: 'Pending',
                reservation_status: {
                    not: 'Cancelled',
                },
                created_at: {
                    gte: today,
                    lte: now,
                },
            },
        });

        const cancelPromises = unpaidReservations.map(reservation =>
            prisma.reservation.update({
                where: { id: reservation.id },
                data: { reservation_status: 'Cancelled' },
            })
        );

        await Promise.all(cancelPromises);

        console.log(`[CANCEL TASK] Cancelled ${unpaidReservations.length} unpaid reservations.`);
    } catch (error) {
        console.error('[CANCEL TASK] Error:', error);
    }
};

// Run every day at 7:00 PM
cron.schedule('0 19 * * *', cancelUnpaidReservations);
