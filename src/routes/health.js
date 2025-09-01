const express = require('express');
const config = require('../config');

const router = express.Router();

/**
 * Basic health check
 * GET /health
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.env,
    version: '1.0.0'
  });
});

/**
 * Detailed health check
 * GET /health/detailed
 */
router.get('/detailed', (req, res) => {
  const memUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: {
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
      },
      node_version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    config: {
      environment: config.env,
      supported_languages: config.supportedLanguages,
      api_version: config.api.version
    },
    services: {
      template_generator: 'operational',
      type_mapper: 'operational',
      validation: 'operational'
    }
  });
});

/**
 * Readiness check (for Kubernetes/container orchestration)
 * GET /health/ready
 */
router.get('/ready', (req, res) => {
  // In a real application, you might check database connections,
  // external service availability, etc.
  
  const checks = {
    template_service: true,
    type_mappings: true,
    validation_service: true
  };
  
  const allHealthy = Object.values(checks).every(check => check === true);
  
  if (allHealthy) {
    res.json({
      status: 'ready',
      checks,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      checks,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness check (for Kubernetes/container orchestration)
 * GET /health/live
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;