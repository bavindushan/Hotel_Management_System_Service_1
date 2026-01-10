const generateToken = require("../utils/generateToken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PublicService {
    async getRooms() {
        const roomTypes = await prisma.roomtype.findMany({
            include: {
                room: {
                    include: {
                        branch: true,
                    },
                },
            },
        });

        return roomTypes.map((type) => {
            const totalRooms = type.room.length;

            const branchesMap = {};

            type.room.forEach((room) => {
                if (!room.branch) return;

                if (!branchesMap[room.branch.id]) {
                    branchesMap[room.branch.id] = {
                        branch_id: room.branch.id,
                        branch_name: room.branch.name,
                        available_rooms: 0,
                    };
                }

                if (room.status === 'Available') {
                    branchesMap[room.branch.id].available_rooms += 1;
                }
            });

            return {
                room_type_id: type.id,
                type_name: type.type_name,
                description: type.description,
                base_price: type.base_price,
                total_rooms: totalRooms,
                branches: Object.values(branchesMap),
            };
        });
    }

    async getRoomAvailability({ branch_id, room_type_id, check_in_date, check_out_date }) {

        if (!branch_id || !room_type_id || !check_in_date || !check_out_date) {
            throw new ValidationError('branch_id, room_type_id, check_in_date and check_out_date are required');
        }

        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);

        if (checkIn >= checkOut) {
            throw new ValidationError('check_out_date must be after check_in_date');
        }

        // 1. Get all rooms of that type in that branch
        const rooms = await prisma.room.findMany({
            where: {
                branch_id: Number(branch_id),
                room_type_id: Number(room_type_id),
                status: 'Available',
            },
            select: {
                id: true,
                room_number: true,
            },
        });

        if (!rooms.length) {
            return {
                success: true,
                statusCode: 200,
                data: {
                    total_rooms: 0,
                    available_rooms: 0,
                },
            };
        }

        const roomIds = rooms.map(r => r.id);

        // 2. Find booked rooms in date range
        const bookedRooms = await prisma.bookedrooms.findMany({
            where: {
                room_id: { in: roomIds },
                reservation: {
                    check_in_date: { lt: checkOut },
                    check_out_date: { gt: checkIn },
                    reservation_status: {
                        not: 'Cancelled',
                    },
                },
            },
            select: { room_id: true },
        });

        // 3. Find blocked rooms in date range
        const blockedRooms = await prisma.blockedbookingrooms.findMany({
            where: {
                room_id: { in: roomIds },
                blockedbooking: {
                    start_date: { lt: checkOut },
                    end_date: { gt: checkIn },
                },
            },
            select: { room_id: true },
        });

        const unavailableRoomIds = new Set([
            ...bookedRooms.map(r => r.room_id),
            ...blockedRooms.map(r => r.room_id),
        ]);

        const availableRooms = rooms.filter(r => !unavailableRoomIds.has(r.id));

        return {
            success: true,
            statusCode: 200,
            data: {
                total_rooms: rooms.length,
                available_rooms: availableRooms.length,
            },
        };
    }
}

module.exports = new PublicService();
