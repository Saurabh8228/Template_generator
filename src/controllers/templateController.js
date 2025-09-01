const TemplateGeneratorService = require('../services/templateGenerator');
const { getTypeMapping } = require('../utils/typeMappers');
const config = require('../config');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Controller for template generation endpoints
 */
class TemplateController {
  
  /**
   * Generate code template
   * POST /api/v1/template
   */
  static async generateTemplate(req, res, next) {
    try {
      const { question_id, title, description, signature, language } = req.validatedData;
      
      // Generate template using the service
      const template = TemplateGeneratorService.generate(signature, language, question_id);
      
      // Return successful response
      res.status(HTTP_STATUS.CREATED).json({
        language,
        template,
        metadata: {
          question_id,
          title,
          function_name: signature.function_name,
          parameter_count: signature.parameters.length,
          generated_at: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get supported languages and type system info
   * GET /api/v1/languages
   */
  static async getSupportedLanguages(req, res) {
    res.json({
      supported_languages: config.supportedLanguages,
      type_system: {
        primitives: ['int', 'long', 'float', 'double', 'bool', 'string'],
        collections: ['T[]', 'List<T>'],
        special: ['Tree<T>', 'Graph']
      },
      examples: {
        primitives: ['int', 'string', 'bool'],
        arrays: ['int[]', 'string[]'],
        lists: ['List<int>', 'List<string>', 'List<List<int>>'],
        trees: ['Tree<int>', 'Tree<string>'],
        graphs: ['Graph']
      }
    });
  }

  /**
   * Get type mappings for a specific language
   * GET /api/v1/types/:language
   */
  static async getTypeMappings(req, res) {
    const { language } = req.params;
    
    const typeMapping = getTypeMapping(language);
    
    res.json({
      language,
      type_mappings: typeMapping,
      total_types: Object.keys(typeMapping).length,
      categories: {
        primitives: Object.entries(typeMapping)
          .filter(([dsl]) => ['int', 'long', 'float', 'double', 'bool', 'string'].includes(dsl))
          .reduce((obj, [dsl, mapped]) => ({ ...obj, [dsl]: mapped }), {}),
        collections: Object.entries(typeMapping)
          .filter(([dsl]) => dsl.includes('[]') || dsl.includes('List'))
          .reduce((obj, [dsl, mapped]) => ({ ...obj, [dsl]: mapped }), {}),
        special: Object.entries(typeMapping)
          .filter(([dsl]) => dsl.includes('Tree') || dsl.includes('Graph'))
          .reduce((obj, [dsl, mapped]) => ({ ...obj, [dsl]: mapped }), {})
      }
    });
  }

  /**
   * Validate template generation (dry run)
   * POST /api/v1/template/validate
   */
  static async validateTemplate(req, res, next) {
    try {
      const { signature, language } = req.validatedData;
      
      // Perform validation without generating template
      const typeErrors = require('../utils/typeMappers').validateTypes(
        signature.parameters,
        signature.returns,
        language
      );
      
      if (typeErrors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          valid: false,
          errors: typeErrors
        });
      }
      
      res.json({
        valid: true,
        message: 'Template can be generated successfully',
        signature_analysis: {
          function_name: signature.function_name,
          parameter_count: signature.parameters.length,
          return_type: signature.returns.type,
          language_mapping: {
            parameters: signature.parameters.map(param => ({
              name: param.name,
              dsl_type: param.type,
              mapped_type: require('../utils/typeMappers').mapType(param.type, language)
            })),
            return_type: {
              dsl_type: signature.returns.type,
              mapped_type: require('../utils/typeMappers').mapType(signature.returns.type, language)
            }
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get template generation statistics
   * GET /api/v1/stats
   */
  static async getStats(req, res) {
    // In a real application, this would pull from a database or metrics store
    res.json({
      api_version: 'v1',
      supported_languages: config.supportedLanguages.length,
      total_supported_types: Object.keys(require('../utils/typeMappers').TYPE_MAPPINGS.java).length,
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage: process.memoryUsage(),
      node_version: process.version,
      last_updated: new Date().toISOString()
    });
  }
}

module.exports = TemplateController;