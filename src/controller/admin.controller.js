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

module.exports = {
    addRoom,
};
