const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const travelCompanyController = require('../controller/travelCompany.controller');
const authMiddleware = require('../middlewares/authMiddleware');




module.exports = router;

