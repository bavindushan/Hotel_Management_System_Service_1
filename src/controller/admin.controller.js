const adminService = require('../service/admin.service');

const addRoom = async (req, res) => {
    try {
        const { room_number, room_type_id, branch_id, status, price_per_night } = req.body;

        // Validate required fields
        if (!room_number || !room_type_id || !branch_id) {
            return res.status(400).json({ message: 'room_number, room_type_id and branch_id are required' });
        }

        const newRoom = await adminService.createRoom({
            room_number,
            room_type_id,
            branch_id,
            status,
            price_per_night,
        });

        return res.status(201).json(newRoom);
    } catch (error) {
        console.error('Error in addRoom:', error);
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const updateRoom = async (req, res) => {
    try {
        const roomId = parseInt(req.params.id, 10);
        if (isNaN(roomId)) {
            return res.status(400).json({ message: 'Invalid room ID' });
        }

        const updateData = req.body;

        // Optional: you can validate allowed fields here
        // e.g. only allow status and price_per_night updates
        const allowedFields = ['status', 'price_per_night', 'room_number', 'room_type_id', 'branch_id'];
        const fieldsToUpdate = {};
        for (const key of allowedFields) {
            if (key in updateData) {
                fieldsToUpdate[key] = updateData[key];
            }
        }

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const updatedRoom = await adminService.updateRoom(roomId, fieldsToUpdate);
        return res.status(200).json(updatedRoom);
    } catch (error) {
        console.error('Error in updateRoom:', error);
        if (error.message === 'Room not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const addRoomType = async (req, res) => {
    try {
        const { type_name, description, base_price } = req.body;

        if (!type_name || base_price === undefined) {
            return res.status(400).json({ message: 'type_name and base_price are required' });
        }

        // base_price must be a valid number
        const price = parseFloat(base_price);
        if (isNaN(price)) {
            return res.status(400).json({ message: 'base_price must be a valid number' });
        }

        const newRoomType = await adminService.createRoomType({
            type_name,
            description,
            base_price: price,
        });

        return res.status(201).json(newRoomType);
    } catch (error) {
        console.error('Error in addRoomType:', error);
        if (error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, role_id, branch_id } = req.body;

        // Basic validation
        if (!username || !email || !password || !role_id) {
            return res.status(400).json({ message: 'username, email, password, and role_id are required' });
        }

        const user = await adminService.createUser({ username, email, password, role_id, branch_id });

        // Remove password_hash before sending response
        const { password_hash, ...userWithoutPassword } = user;

        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const { page, limit, role_id, branch_id, search } = req.query;

        // Parse pagination params as integers
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;

        const data = await adminService.getUsers({
            page: pageNumber,
            limit: limitNumber,
            role_id: role_id ? parseInt(role_id) : undefined,
            branch_id: branch_id ? parseInt(branch_id) : undefined,
            search,
        });

        // Remove password_hash from each user before sending response
        const usersWithoutPasswords = data.users.map(({ password_hash, ...rest }) => rest);

        res.status(200).json({
            total: data.total,
            page: data.page,
            limit: data.limit,
            users: usersWithoutPasswords,
        });
    } catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};



module.exports = {
    addRoom,
    updateRoom,
    addRoomType,
    createUser,
    getUsers,
};
