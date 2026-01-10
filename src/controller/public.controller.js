const asyncHandler = require('express-async-handler');
const PublicService = require('../service/public.service.js');

const getRooms = async (req, res) => {
  const result = await publicService.getRooms();

  res.status(200).json({
    success: true,
    data: result,
  });
};

const getRoomAvailability = async (req, res, next) => {
    try {
        const result = await PublicService.getRoomAvailability(req.query);

        res.status(result.statusCode).json({
            success: result.success,
            data: result.data,
        });
            } catch (err) {
        next(err);
    }
};


module.exports = {
  getRooms,
  getRoomAvailability,  
};
