// Type mappings for different programming languages
const TYPE_MAPPINGS = {
  java: {
    int: 'int',
    long: 'long',
    float: 'float',
    double: 'double',
    bool: 'boolean',
    string: 'String',
    'int[]': 'int[]',
    'long[]': 'long[]',
    'float[]': 'float[]',
    'double[]': 'double[]',
    'bool[]': 'boolean[]',
    'string[]': 'String[]',
    'List<int>': 'List<Integer>',
    'List<long>': 'List<Long>',
    'List<float>': 'List<Float>',
    'List<double>': 'List<Double>',
    'List<bool>': 'List<Boolean>',
    'List<string>': 'List<String>',
    'List<int[]>': 'List<int[]>',
    'List<List<int>>': 'List<List<Integer>>',
    'Tree<int>': 'TreeNode',
    'Tree<string>': 'TreeNode',
    Graph: 'int[][]'
  },
  python: {
    int: 'int',
    long: 'int',
    float: 'float',
    double: 'float',
    bool: 'bool',
    string: 'str',
    'int[]': 'List[int]',
    'long[]': 'List[int]',
    'float[]': 'List[float]',
    'double[]': 'List[float]',
    'bool[]': 'List[bool]',
    'string[]': 'List[str]',
    'List<int>': 'List[int]',
    'List<long>': 'List[int]',
    'List<float>': 'List[float]',
    'List<double>': 'List[float]',
    'List<bool>': 'List[bool]',
    'List<string>': 'List[str]',
    'List<int[]>': 'List[List[int]]',
    'List<List<int>>': 'List[List[int]]',
    'Tree<int>': 'Optional[TreeNode]',
    'Tree<string>': 'Optional[TreeNode]',
    Graph: 'List[List[int]]'
  },
  cpp: {
    int: 'int',
    long: 'long long',
    float: 'float',
    double: 'double',
    bool: 'bool',
    string: 'string',
    'int[]': 'vector<int>',
    'long[]': 'vector<long long>',
    'float[]': 'vector<float>',
    'double[]': 'vector<double>',
    'bool[]': 'vector<bool>',
    'string[]': 'vector<string>',
    'List<int>': 'vector<int>',
    'List<long>': 'vector<long long>',
    'List<float>': 'vector<float>',
    'List<double>': 'vector<double>',
    'List<bool>': 'vector<bool>',
    'List<string>': 'vector<string>',
    'List<int[]>': 'vector<vector<int>>',
    'List<List<int>>': 'vector<vector<int>>',
    'Tree<int>': 'TreeNode*',
    'Tree<string>': 'TreeNode*',
    Graph: 'vector<vector<int>>'
  },
  javascript: {
    int: 'number',
    long: 'number',
    float: 'number',
    double: 'number',
    bool: 'boolean',
    string: 'string',
    'int[]': 'number[]',
    'long[]': 'number[]',
    'float[]': 'number[]',
    'double[]': 'number[]',
    'bool[]': 'boolean[]',
    'string[]': 'string[]',
    'List<int>': 'number[]',
    'List<long>': 'number[]',
    'List<float>': 'number[]',
    'List<double>': 'number[]',
    'List<bool>': 'boolean[]',
    'List<string>': 'string[]',
    'List<int[]>': 'number[][]',
    'List<List<int>>': 'number[][]',
    'Tree<int>': 'TreeNode',
    'Tree<string>': 'TreeNode',
    Graph: 'number[][]'
  }
};

/**
 * Get the type mapping for a specific language
 * @param {string} language - The target language
 * @returns {Object} - Type mapping object for the language
 */
function getTypeMapping(language) {
  return TYPE_MAPPINGS[language] || {};
}

/**
 * Map a DSL type to language-specific type
 * @param {string} dslType - The DSL type to map
 * @param {string} language - The target language
 * @returns {string} - The mapped type in target language
 */
function mapType(dslType, language) {
  const typeMapping = getTypeMapping(language);
  return typeMapping[dslType] || dslType;
}

/**
 * Check if a type is supported for a given language
 * @param {string} type - The type to check
 * @param {string} language - The target language
 * @returns {boolean} - Whether the type is supported
 */
function isTypeSupported(type, language) {
  const typeMapping = getTypeMapping(language);
  return Object.prototype.hasOwnProperty.call(typeMapping, type);
}

/**
 * Validate all types in parameters and return type for a language
 * @param {Array} parameters - Array of parameter objects with type property
 * @param {Object} returns - Return type object
 * @param {string} language - Target language
 * @returns {Array} - Array of error messages, empty if all types are valid
 */
function validateTypes(parameters, returns, language) {
  const errors = [];
  
  // Validate parameter types
  for (const param of parameters) {
    if (!isTypeSupported(param.type, language)) {
      errors.push(`Unsupported parameter type: ${param.type} for language: ${language}`);
    }
  }
  
  // Validate return type
  if (!isTypeSupported(returns.type, language)) {
    errors.push(`Unsupported return type: ${returns.type} for language: ${language}`);
  }
  
  return errors;
}

/**
 * Get JSDoc type mapping for JavaScript
 * @param {string} dslType - DSL type
 * @returns {string} - JSDoc type annotation
 */
function getJSDocType(dslType) {
  const jsDocMapping = {
    int: 'number',
    long: 'number',
    float: 'number',
    double: 'number',
    bool: 'boolean',
    string: 'string',
    'int[]': 'number[]',
    'long[]': 'number[]',
    'float[]': 'number[]',
    'double[]': 'number[]',
    'bool[]': 'boolean[]',
    'string[]': 'string[]',
    'List<int>': 'number[]',
    'List<long>': 'number[]',
    'List<float>': 'number[]',
    'List<double>': 'number[]',
    'List<bool>': 'boolean[]',
    'List<string>': 'string[]',
    'List<int[]>': 'number[][]',
    'List<List<int>>': 'number[][]',
    'Tree<int>': 'TreeNode',
    'Tree<string>': 'TreeNode',
    Graph: 'number[][]'
  };
  return jsDocMapping[dslType] || dslType;
}

/**
 * Get default return value for a type in a specific language
 * @param {string} mappedType - The mapped type in target language
 * @param {string} language - Target language
 * @returns {string} - Default return statement
 */
function getDefaultReturn(mappedType, language) {
  const numericTypes = ['int', 'long', 'float', 'double', 'number'];
  const booleanTypes = ['boolean', 'bool'];
  const stringTypes = ['String', 'string', 'str'];
  
  // Check if it's a collection type
  const isCollection = mappedType.includes('[]') || 
                      mappedType.includes('vector') || 
                      mappedType.includes('List') || 
                      mappedType.includes('Array');
  
  // Check if it's a tree/pointer type
  const isPointer = mappedType.includes('*') || 
                   mappedType.includes('TreeNode') || 
                   mappedType.includes('Optional');
  
  if (isPointer) {
    return language === 'python' ? 'return None' : 'return null;';
  }
  
  if (isCollection) {
    return language === 'python' ? 'return []' : 'return {};';
  }
  
  // Check base type
  const baseType = mappedType.toLowerCase();
  
  if (numericTypes.some(type => baseType.includes(type.toLowerCase()))) {
    return language === 'python' ? 'return 0' : 'return 0;';
  }
  
  if (booleanTypes.some(type => baseType.includes(type.toLowerCase()))) {
    return language === 'python' ? 'return False' : 'return false;';
  }
  
  if (stringTypes.some(type => baseType.includes(type.toLowerCase()))) {
    return language === 'python' ? 'return ""' : 'return "";';
  }
  
  // Default fallback
  return language === 'python' ? 'pass' : 'return {};';
}

module.exports = {
  TYPE_MAPPINGS,
  getTypeMapping,
  mapType,
  isTypeSupported,
  validateTypes,
  getJSDocType,
  getDefaultReturn
};