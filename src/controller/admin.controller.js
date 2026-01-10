const adminRoomsService = require('../service/admin.service');

const addRoom = async (req, res) => {
    try {
        const { room_number, room_type_id, branch_id, status, price_per_night } = req.body;

        // Validate required fields
        if (!room_number || !room_type_id || !branch_id) {
            return res.status(400).json({ message: 'room_number, room_type_id and branch_id are required' });
        }

        const newRoom = await adminRoomsService.createRoom({
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

        const updatedRoom = await adminRoomsService.updateRoom(roomId, fieldsToUpdate);
        return res.status(200).json(updatedRoom);
    } catch (error) {
        console.error('Error in updateRoom:', error);
        if (error.message === 'Room not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    addRoom,
    updateRoom,
};
