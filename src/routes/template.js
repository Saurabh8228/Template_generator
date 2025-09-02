const express = require('express');
const TemplateController = require('../controllers/templateController');
const { validateTemplateRequest, validateLanguageParam } = require('../middleware/validation');
const config = require('../config');

const router = express.Router();

/**
 * Generate code template
 * POST /api/v1/template
 */
router.post('/template', validateTemplateRequest, TemplateController.generateTemplate);

/**
 * Validate template generation (dry run)
 * POST /api/v1/template/validate
 */
router.post('/template/validate', validateTemplateRequest, TemplateController.validateTemplate);

/**
 * Get supported languages and type system
 * GET /api/v1/languages
 */
router.get('/languages', TemplateController.getSupportedLanguages);

/**
 * Get type mappings for specific language
 * GET /api/v1/types/:language
 */
router.get('/types/:language', validateLanguageParam, TemplateController.getTypeMappings);

/**
 * Get API statistics
 * GET /api/v1/stats
 */
router.get('/stats', TemplateController.getStats);

/**
 * API documentation endpoint
 * GET /api/v1/docs
 */
router.get('/docs', (req, res) => {
  res.json({
    api_name: 'Code Template Generator API',
    version: 'v1',
    base_url: `${req.protocol}://${req.get('host')}/api/v1`,
    endpoints: [
      {
        method: 'POST',
        path: '/template',
        description: 'Generate a code template for a DSA problem',
        content_type: 'application/json',
        example_request: {
          question_id: 'two-sum',
          title: 'Two Sum',
          description: 'Given an integer array nums and an integer target...',
          signature: {
            function_name: 'twoSum',
            parameters: [
              { name: 'nums', type: 'int[]' },
              { name: 'target', type: 'int' }
            ],
            returns: { type: 'int[]' }
          },
          language: 'python'
        }
      },
      {
        method: 'POST',
        path: '/template/validate',
        description: 'Validate template parameters without generating code',
        content_type: 'application/json'
      },
      {
        method: 'GET',
        path: '/languages',
        description: 'Get list of supported languages and type system information'
      },
      {
        method: 'GET',
        path: '/types/{language}',
        description: 'Get type mappings for a specific language',
        parameters: {
          language: 'One of: java, python, cpp, javascript'
        }
      },
      {
        method: 'GET',
        path: '/stats',
        description: 'Get API statistics and system information'
      }
    ],
    rate_limits: {
      requests_per_window: 100,
      window_duration: '15 minutes'
    },
    supported_languages: config.supportedLanguages
  });
});

module.exports = router;