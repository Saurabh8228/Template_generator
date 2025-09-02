const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.api.rateLimit.windowMs,
  max: config.api.rateLimit.max,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retry_after: Math.ceil(config.api.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retry_after: Math.ceil(config.api.rateLimit.windowMs / 1000)
    });
  }
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// Compression and logging
app.use(compression());

// Custom morgan tokens
morgan.token('id', (req) => req.id);
morgan.token('body', (req) => {
  if (req.method === 'POST' && req.body) {
    // Don't log sensitive data, just structure
    return JSON.stringify({
      question_id: req.body.question_id,
      language: req.body.language,
      function_name: req.body.signature?.function_name
    });
  }
  return '';
});

const logFormat = config.env === 'production' 
  ? 'combined'
  : ':method :url :status :res[content-length] - :response-time ms :body';

app.use(morgan(logFormat));

// Body parsing with size limits
app.use(express.json({ 
  limit: config.api.maxPayloadSize,
  strict: true,
  verify: (req, res, buf) => {
    // Store raw body for debugging if needed
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: config.api.maxPayloadSize 
}));

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// API routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;