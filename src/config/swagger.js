const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Outsider Services API',
        description: 'Hotel Management System - Customer Services',
    },
    host: 'localhost:5000',
    schemes: ['http'],
    tags: [
        {
            name: 'Customer',
            description: 'Customer authentication and registration',
        },
    ],
};

const outputFile = './swagger-output.json'; 
const endpointsFiles = ['./src/routes/route.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
