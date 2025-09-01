const express = require('express');
const healthRoutes = require('./health');
const templateRoutes = require('./template');

const router = express.Router();

// Health check routes
router.use('/health', healthRoutes);

// API v1 routes
router.use('/api/v1', templateRoutes);

// Root endpoint - API info
router.get('/', (req, res) => {
  res.json({
    name: 'Code Template Generator API',
    version: '1.0.0',
    description: 'Production-ready HTTP API for generating code templates for DSA problems',
    endpoints: {
      health: '/health',
      template_generation: '/api/v1/template',
      supported_languages: '/api/v1/languages',
      type_mappings: '/api/v1/types/{language}',
      validation: '/api/v1/template/validate',
      statistics: '/api/v1/stats'
    },
    documentation: '/docs/API.md',
    repository: 'https://github.com/your-org/code-template-generator'
  });
});

module.exports = router;