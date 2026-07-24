const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Futura Labs Ai Tutor LMS API',
      version: '1.0.0',
      description: 'Complete Learning Management System API with RBAC',
      contact: { name: 'Futura Labs', email: 'info@futuralabs.com' },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

module.exports = swaggerJsdoc(options);
