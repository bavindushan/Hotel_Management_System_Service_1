const jwt = require('jsonwebtoken');

const authenticateRole = (allowedRoles) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });

        // Check if user role is allowed
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateRole;
