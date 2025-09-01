// Supported DSL types
const DSL_TYPES = {
  PRIMITIVES: ['int', 'long', 'float', 'double', 'bool', 'string'],
  ARRAYS: ['int[]', 'long[]', 'float[]', 'double[]', 'bool[]', 'string[]'],
  LISTS: ['List<int>', 'List<long>', 'List<float>', 'List<double>', 'List<bool>', 'List<string>', 'List<int[]>', 'List<List<int>>'],
  TREES: ['Tree<int>', 'Tree<string>'],
  GRAPHS: ['Graph']
};

// All supported types (flattened)
const ALL_SUPPORTED_TYPES = [
  ...DSL_TYPES.PRIMITIVES,
  ...DSL_TYPES.ARRAYS,
  ...DSL_TYPES.LISTS,
  ...DSL_TYPES.TREES,
  ...DSL_TYPES.GRAPHS
];

// Language-specific configurations
const LANGUAGE_CONFIGS = {
  java: {
    extension: '.java',
    mainClass: 'Main',
    solutionClass: 'Solution',
    needsImports: true,
    needsTreeNodeClass: true
  },
  python: {
    extension: '.py',
    mainCheck: 'if __name__ == "__main__":',
    solutionClass: 'Solution',
    needsImports: true,
    needsTreeNodeClass: true
  },
  cpp: {
    extension: '.cpp',
    namespace: 'std',
    solutionClass: 'Solution',
    needsIncludes: true,
    needsTreeNodeStruct: true
  },
  javascript: {
    extension: '.js',
    functionStyle: 'var',
    needsJSDoc: true,
    needsTreeNodeFunction: true
  }
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  TYPE_VALIDATION_ERROR: 'Type Validation Error',
  UNSUPPORTED_LANGUAGE: 'Language not supported',
  UNSUPPORTED_TYPE: 'Unsupported type for language',
  ENDPOINT_NOT_FOUND: 'Endpoint not found',
  INTERNAL_ERROR: 'Internal Server Error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded'
};

// Regular expressions for validation
const VALIDATION_PATTERNS = {
  QUESTION_ID: /^[a-zA-Z0-9-_]+$/,
  FUNCTION_NAME: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  PARAMETER_NAME: /^[a-zA-Z_][a-zA-Z0-9_]*$/
};

module.exports = {
  DSL_TYPES,
  ALL_SUPPORTED_TYPES,
  LANGUAGE_CONFIGS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  VALIDATION_PATTERNS
};