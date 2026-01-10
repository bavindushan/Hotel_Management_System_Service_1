const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

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

const createRoomType = async ({ type_name, description, base_price }) => {
    // // Check uniqueness of type_name
    // const existing = await prisma.roomtype.findUnique({
    //     where: { type_name },
    // });

    // if (existing) {
    //     throw new Error(`Room type with type_name "${type_name}" already exists`);
    // }

    // Create new room type
    const newRoomType = await prisma.roomtype.create({
        data: {
            type_name,
            description,
            base_price: parseFloat(base_price),
        },
    });

    return newRoomType;
};

const createUser = async ({ username, email, password, role_id, branch_id }) => {
    // Check if role exists
    const role = await prisma.role.findUnique({
        where: { role_id }
    });
    if (!role) {
        throw new Error('Invalid role_id: Role does not exist');
    }

    // Optional: Check if branch exists (if provided)
    if (branch_id) {
        const branch = await prisma.branch.findUnique({
            where: { id: branch_id }
        });
        if (!branch) {
            throw new Error('Invalid branch_id: Branch does not exist');
        }
    }

    // Check if email or username already taken 
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }]
        }
    });
    if (existingUser) {
        throw new Error('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
        data: {
            username,
            email,
            password_hash: hashedPassword,
            role_id,
            branch_id: branch_id || null,
        },
    });

    return newUser;
};

const getUsers = async ({ page = 1, limit = 10, role_id, branch_id, search }) => {
    const skip = (page - 1) * limit;

    const where = {};

    if (role_id) {
        where.role_id = role_id;
    }

    if (branch_id) {
        where.branch_id = branch_id;
    }

    if (search) {
        where.OR = [
            { username: { contains: search } },  
            { email: { contains: search } },     
        ];
    }

    const total = await prisma.user.count({
        where,
    });

    const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
            role: true,
            branch: true,
        },
        orderBy: {
            id: 'asc',
        },
    });

    return {
        total,
        page,
        limit,
        users,
    };
};




module.exports = {
    createRoom,
    updateRoom,
    createRoomType,
    createUser,
    getUsers,
};
