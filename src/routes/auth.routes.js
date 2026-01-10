const express = require('express');
const router = express.Router();

const { login } = require('../controller/auth.controller');
const authenticateRole = require('../middlewares/auth.middleware');

// Public login endpoint
router.post('/login', login);

// // Protected route only accessible to admins
// router.get('/admin/dashboard', authenticateRole(['admin']), (req, res) => {
//     res.json({ message: `Welcome Admin: ${req.user.email}` });
// });

// // Protected route only accessible to managers
// router.get('/manager/dashboard', authenticateRole(['manager']), (req, res) => {
//     res.json({ message: `Welcome Manager: ${req.user.email}` });
// });

// // Protected route only accessible to receptionists
// router.get('/reception/checkin', authenticateRole(['receptionist']), (req, res) => {
//     res.json({ message: `Receptionist area access granted for ${req.user.email}` });
// });

module.exports = router;
