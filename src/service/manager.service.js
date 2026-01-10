const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
    AppError,
    ValidationError,
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} = require('../utils/AppError'); 

const getDailyOccupancyReport = async ({ date, branch_id }) => {
    const targetDate = date ? new Date(date) : new Date();

    if (isNaN(targetDate.getTime())) {
        throw new ValidationError('Invalid date format');
    }

    // ---------- TOTAL ROOMS ----------
    const totalRooms = await prisma.room.count({
        where: branch_id ? { branch_id: Number(branch_id) } : {}
    });

    // ---------- OCCUPIED ROOMS ----------
    const occupiedRooms = await prisma.bookedrooms.count({
        where: {
            reservation: {
                check_in_date: {
                    lte: targetDate
                },
                check_out_date: {
                    gt: targetDate
                },
                reservation_status: {
                    notIn: ['Cancelled', 'No_show']
                },
                ...(branch_id && { branch_id: Number(branch_id) })
            }
        }
    });

    return {
        date: targetDate.toISOString().split('T')[0],
        total_rooms: totalRooms,
        occupied_rooms: occupiedRooms
    };
};

const getProjectedOccupancyReport = async ({ from_date, to_date, branch_id }) => {
    if (!from_date || !to_date) {
        throw new ValidationError('from_date and to_date are required');
    }

    const startDate = new Date(from_date);
    const endDate = new Date(to_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid date format');
    }

    if (startDate > endDate) {
        throw new ValidationError('from_date must be before to_date');
    }

    // ---------- TOTAL ROOMS ----------
    const totalRooms = await prisma.room.count({
        where: branch_id ? { branch_id: Number(branch_id) } : {}
    });

    const results = [];

    // ---------- LOOP THROUGH EACH DATE ----------
    for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
    ) {
        const currentDate = new Date(d);

        const occupiedRooms = await prisma.bookedrooms.count({
            where: {
                reservation: {
                    check_in_date: {
                        lte: currentDate
                    },
                    check_out_date: {
                        gt: currentDate
                    },
                    reservation_status: {
                        notIn: ['Cancelled', 'No_show']
                    },
                    ...(branch_id && { branch_id: Number(branch_id) })
                }
            }
        });

        results.push({
            date: currentDate.toISOString().split('T')[0],
            occupied_rooms: occupiedRooms,
            available_rooms: totalRooms - occupiedRooms
        });
    }

    return results;
};

const getRevenueReport = async ({ from_date, to_date, branch_id, groupBy }) => {
    if (!from_date || !to_date) {
        throw new ValidationError('from_date and to_date are required');
    }

    const startDate = new Date(from_date);
    const endDate = new Date(to_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid date format');
    }

    // ---------- BASE FILTER ----------
    const whereClause = {
        billing_date: {
            gte: startDate,
            lte: endDate
        },
        ...(branch_id && {
            reservation: {
                branch_id: Number(branch_id)
            }
        })
    };

    // ---------- NO GROUPING (OVERALL SUMMARY) ----------
    if (!groupBy) {
        const totals = await prisma.billing.aggregate({
            where: whereClause,
            _sum: {
                total_amount: true,
                tax_amount: true,
                other_charges: true
            }
        });

        const paidCount = await prisma.billing.count({
            where: {
                ...whereClause,
                status: 'Paid'
            }
        });

        const unpaidCount = await prisma.billing.count({
            where: {
                ...whereClause,
                status: 'Unpaid'
            }
        });

        return {
            total_revenue: totals._sum.total_amount || 0,
            tax: totals._sum.tax_amount || 0,
            other_charges: totals._sum.other_charges || 0,
            paid_reservations: paidCount,
            unpaid_reservations: unpaidCount
        };
    }

    // ---------- GROUPED REPORT (DAILY / MONTHLY) ----------
    const billings = await prisma.billing.findMany({
        where: whereClause,
        select: {
            billing_date: true,
            total_amount: true,
            tax_amount: true,
            other_charges: true
        }
    });

    const grouped = {};

    billings.forEach(bill => {
        const date = new Date(bill.billing_date);

        const key =
            groupBy === 'monthly'
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                : date.toISOString().split('T')[0];

        if (!grouped[key]) {
            grouped[key] = {
                period: key,
                total_revenue: 0,
                tax: 0,
                other_charges: 0
            };
        }

        grouped[key].total_revenue += Number(bill.total_amount || 0);
        grouped[key].tax += Number(bill.tax_amount || 0);
        grouped[key].other_charges += Number(bill.other_charges || 0);
    });

    return Object.values(grouped);
};

const getNoShowReport = async ({ from_date, to_date, branch_id }) => {

    const whereClause = {
        reservation_status: 'No_show',
        ...(branch_id && { branch_id: Number(branch_id) }),
        ...((from_date || to_date) && {
            check_in_date: {
                ...(from_date && { gte: new Date(from_date) }),
                ...(to_date && { lte: new Date(to_date) })
            }
        })
    };

    const reservations = await prisma.reservation.findMany({
        where: whereClause,
        select: {
            id: true,
            check_in_date: true,
            bookedrooms: {
                select: { id: true }
            },
            customer: {
                select: {
                    full_name: true
                }
            },
            branch: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            check_in_date: 'desc'
        }
    });

    return reservations.map(r => ({
        reservation_id: r.id,
        customer: r.customer?.full_name || 'N/A',
        check_in_date: r.check_in_date,
        rooms: r.bookedrooms.length,
        branch: r.branch?.name || 'N/A'
    }));
};

module.exports = {
    getDailyOccupancyReport,
    getProjectedOccupancyReport,
    getRevenueReport,
    getNoShowReport,
};
