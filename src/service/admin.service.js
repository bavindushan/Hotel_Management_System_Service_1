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

const updateRoom = async (id, data) => {
    // Check if room exists
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
        throw new Error('Room not found');
    }

    // If room_type_id or branch_id are to be updated, validate they exist
    if (data.room_type_id) {
        const roomType = await prisma.roomtype.findUnique({ where: { id: data.room_type_id } });
        if (!roomType) {
            throw new Error('Invalid room_type_id: Room type does not exist');
        }
    }

    if (data.branch_id) {
        const branch = await prisma.branch.findUnique({ where: { id: data.branch_id } });
        if (!branch) {
            throw new Error('Invalid branch_id: Branch does not exist');
        }
    }

    // Update the room
    const updatedRoom = await prisma.room.update({
        where: { id },
        data: {
            ...data,
            price_per_night: data.price_per_night !== undefined ? parseFloat(data.price_per_night) : undefined,
        },
    });

    return updatedRoom;
};

module.exports = {
    createRoom,
    updateRoom,
};
