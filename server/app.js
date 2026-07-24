const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Logging
if (config.env !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/v1', require('./routes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const possiblePaths = [
    path.join(__dirname, '..', 'client', 'dist'),
    path.join(__dirname, '..', '..', 'client', 'dist'),
    path.join(process.cwd(), 'client', 'dist'),
    path.join(process.cwd(), '..', 'client', 'dist'),
  ];
  const clientBuild = possiblePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || possiblePaths[0];
  
  if (fs.existsSync(path.join(clientBuild, 'index.html'))) {
    app.use(express.static(clientBuild));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
    console.log('Serving client from:', clientBuild);
  } else {
    console.error('Client build not found. Looked in:', possiblePaths);
  }
}

// Swagger (dev only)
try {
  if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./docs/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
} catch (err) {
  logger.warn('Swagger not available');
}

// Error handler
app.use(errorHandler);

// 404 handler (production fallback)
app.use((req, res) => {
  if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    const possiblePaths = [
      path.join(__dirname, '..', 'client', 'dist'),
      path.join(__dirname, '..', '..', 'client', 'dist'),
      path.join(process.cwd(), 'client', 'dist'),
    ];
    const clientBuild = possiblePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || possiblePaths[0];
    if (fs.existsSync(path.join(clientBuild, 'index.html'))) {
      return res.sendFile(path.join(clientBuild, 'index.html'));
    }
  }
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
