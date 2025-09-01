const Joi = require('joi');
const config = require('../config');
const { ALL_SUPPORTED_TYPES, VALIDATION_PATTERNS } = require('../utils/constants');

// Template request validation schema
const templateRequestSchema = Joi.object({
  question_id: Joi.string()
    .required()
    .pattern(VALIDATION_PATTERNS.QUESTION_ID)
    .min(1)
    .max(100)
    .messages({
      'string.pattern.base': 'question_id must contain only alphanumeric characters, hyphens, and underscores',
      'string.empty': 'question_id is required',
      'string.min': 'question_id must be at least 1 character long',
      'string.max': 'question_id must not exceed 100 characters'
    }),
    
  title: Joi.string()
    .required()
    .min(1)
    .max(200)
    .messages({
      'string.empty': 'title is required',
      'string.min': 'title must be at least 1 character long',
      'string.max': 'title must not exceed 200 characters'
    }),
    
  description: Joi.string()
    .required()
    .min(1)
    .max(5000)
    .messages({
      'string.empty': 'description is required',
      'string.min': 'description must be at least 1 character long',
      'string.max': 'description must not exceed 5000 characters'
    }),
    
  signature: Joi.object({
    function_name: Joi.string()
      .required()
      .pattern(VALIDATION_PATTERNS.FUNCTION_NAME)
      .min(1)
      .max(100)
      .messages({
        'string.pattern.base': 'function_name must be a valid identifier (start with letter/underscore, followed by letters/numbers/underscores)',
        'string.empty': 'function_name is required'
      }),
      
    parameters: Joi.array()
      .items(
        Joi.object({
          name: Joi.string()
            .required()
            .pattern(VALIDATION_PATTERNS.PARAMETER_NAME)
            .min(1)
            .max(50)
            .messages({
              'string.pattern.base': 'parameter name must be a valid identifier',
              'string.empty': 'parameter name is required'
            }),
          type: Joi.string()
            .required()
            .valid(...ALL_SUPPORTED_TYPES)
            .messages({
              'any.only': `parameter type must be one of: ${ALL_SUPPORTED_TYPES.join(', ')}`
            })
        })
      )
      .required()
      .max(20)
      .messages({
        'array.max': 'maximum 20 parameters allowed'
      }),
      
    returns: Joi.object({
      type: Joi.string()
        .required()
        .valid(...ALL_SUPPORTED_TYPES)
        .messages({
          'any.only': `return type must be one of: ${ALL_SUPPORTED_TYPES.join(', ')}`
        })
    }).required()
  }).required(),
  
  language: Joi.string()
    .required()
    .valid(...config.supportedLanguages)
    .messages({
      'any.only': `language must be one of: ${config.supportedLanguages.join(', ')}`
    })
});

/**
 * Middleware to validate template request payload
 */
function validateTemplateRequest(req, res, next) {
  const { error, value } = templateRequestSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const validationError = new Error('Validation failed');
    validationError.isJoi = true;
    validationError.details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    return next(validationError);
  }
  
  // Attach validated data to request
  req.validatedData = value;
  next();
}

/**
 * Middleware to validate language parameter in URL
 */
function validateLanguageParam(req, res, next) {
  const { language } = req.params;
  
  if (!config.supportedLanguages.includes(language)) {
    return res.status(404).json({
      error: 'Language not supported',
      supported_languages: config.supportedLanguages
    });
  }
  
  next();
}

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Where to get data from ('body', 'params', 'query')
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const validationError = new Error('Validation failed');
      validationError.isJoi = true;
      validationError.details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      return next(validationError);
    }
    
    req[`validated${source.charAt(0).toUpperCase() + source.slice(1)}`] = value;
    next();
  };
}

module.exports = {
  templateRequestSchema,
  validateTemplateRequest,
  validateLanguageParam,
  validate
};