const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express'); // ✅ required for Swagger UI
const swaggerFile = require('./swagger-output.json'); // ✅ generated Swagger JSON

const Router = require('./src/routes/route');
const AppDataSource = require('./src/config/db');
const errorMiddleware = require('./src/middlewares/errorMiddleware');

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api', Router);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Error handling
app.use(errorMiddleware);

// Connect to DB and start server
AppDataSource.initialize()
    .then(() => {
        console.log('Database connected successfully!');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger docs available at: http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((err) => {
        console.error('Error during DB connection:', err);
    });
