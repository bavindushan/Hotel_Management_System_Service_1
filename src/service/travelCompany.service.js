const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient, Prisma } = require('@prisma/client');
const { ValidationError } = require('../utils/AppError');

const prisma = new PrismaClient();

