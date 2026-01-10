const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRoom = async ({ room_number, room_type_id, branch_id, status, price_per_night }) => {
    // Validate that room_type exists
    const roomType = await prisma.roomtype.findUnique({
        where: { id: room_type_id },
    });
    if (!roomType) {
        throw new Error('Invalid room_type_id: Room type does not exist');
    }

    // Validate that branch exists
    const branch = await prisma.branch.findUnique({
        where: { id: branch_id },
    });
    if (!branch) {
        throw new Error('Invalid branch_id: Branch does not exist');
    }

    // Set default status if not provided
    const roomStatus = status || 'Available';

    // Create the room record
    const newRoom = await prisma.room.create({
        data: {
            room_number,
            room_type_id,
            branch_id,
            status: roomStatus,
            price_per_night: price_per_night ? parseFloat(price_per_night) : null,
        },
    });

    return newRoom;
};

module.exports = {
    createRoom,
};
