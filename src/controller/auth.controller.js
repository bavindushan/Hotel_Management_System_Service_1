const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');   
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate token payload
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role?.role_name || 'NoRole',
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
};

module.exports = { login };
