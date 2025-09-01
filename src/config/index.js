require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  // API configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '10mb',
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100 // requests per window
    }
  },

  // Supported languages and their configurations
  supportedLanguages: ['java', 'python', 'cpp', 'javascript'],
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  },

  // Security configuration
  security: {
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    corsEnabled: process.env.CORS_ENABLED !== 'false'
  },

  // Health check configuration
  healthCheck: {
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT, 10) || 5000
  },

  // Template generation limits
  limits: {
    maxParameters: 20,
    maxTitleLength: 200,
    maxDescriptionLength: 5000,
    maxQuestionIdLength: 100,
    maxFunctionNameLength: 100,
    maxParameterNameLength: 50
  }
};

// Validation
const validateConfig = (config) => {
  const errors = [];

  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('Invalid port number. Must be between 1 and 65535.');
  }

  if (!Array.isArray(config.corsOrigins) || config.corsOrigins.length === 0) {
    errors.push('CORS origins must be a non-empty array.');
  }

  if (!['development', 'production', 'test'].includes(config.env)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  if (config.api.rateLimit.windowMs < 1000) {
    errors.push('Rate limit window must be at least 1000ms');
  }

  if (config.api.rateLimit.max < 1) {
    errors.push('Rate limit max must be at least 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Validate configuration on startup
validateConfig(config);

// Log configuration in development
if (config.env === 'development') {
  console.log('📋 Configuration loaded:', {
    env: config.env,
    port: config.port,
    supportedLanguages: config.supportedLanguages,
    corsOrigins: config.corsOrigins,
    rateLimit: config.api.rateLimit
  });
}

module.exports = config;