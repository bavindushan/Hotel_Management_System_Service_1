const express = require('express');
const cors    = require('cors');
const dotenv = require('dotenv');
const setupSwaggerDocs = require('./src/config/swagger');
const Router = require('./src/routes/route');
const errorMiddleware = require('./src/middlewares/errorMiddleware');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors());

// Routes
app.use('/api', Router);

// Swagger docs
setupSwaggerDocs(app);

// Error handling
app.use(errorMiddleware);

// Load node-cron jobs for cancel unpaid reservations
require('./src/jobs/cancelUnpaidReservations.job');
// Load node-cron jobs for update completed reservations
require('./src/jobs/updateCompletedReservations.job');


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at: http://localhost:${PORT}/api-docs`);
});






