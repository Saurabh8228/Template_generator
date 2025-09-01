const {
  getTypeMapping,
  mapType,
  isTypeSupported,
  validateTypes,
  getJSDocType,
  getDefaultReturn
} = require('../../src/utils/typeMappers');

describe('TypeMappers - Unit Tests', () => {
  
  describe('getTypeMapping', () => {
    test('should return correct mapping for supported languages', () => {
      const javaMapping = getTypeMapping('java');
      expect(javaMapping.int).toBe('int');
      expect(javaMapping['List<int>']).toBe('List<Integer>');
      
      const pythonMapping = getTypeMapping('python');
      expect(pythonMapping.int).toBe('int');
      expect(pythonMapping['List<int>']).toBe('List[int]');
    });

    test('should return empty object for unsupported language', () => {
      const mapping = getTypeMapping('unsupported');
      expect(mapping).toEqual({});
    });
  });

  describe('mapType', () => {
    test('should correctly map primitive types', () => {
      expect(mapType('int', 'java')).toBe('int');
      expect(mapType('string', 'java')).toBe('String');
      expect(mapType('bool', 'java')).toBe('boolean');
      
      expect(mapType('int', 'python')).toBe('int');
      expect(mapType('string', 'python')).toBe('str');
      expect(mapType('bool', 'python')).toBe('bool');
    });

    test('should correctly map array types', () => {
      expect(mapType('int[]', 'java')).toBe('int[]');
      expect(mapType('int[]', 'python')).toBe('List[int]');
      expect(mapType('int[]', 'cpp')).toBe('vector<int>');
      expect(mapType('int[]', 'javascript')).toBe('number[]');
    });

    test('should correctly map list types', () => {
      expect(mapType('List<int>', 'java')).toBe('List<Integer>');
      expect(mapType('List<int>', 'python')).toBe('List[int]');
      expect(mapType('List<int>', 'cpp')).toBe('vector<int>');
      expect(mapType('List<int>', 'javascript')).toBe('number[]');
    });

    test('should correctly map tree types', () => {
      expect(mapType('Tree<int>', 'java')).toBe('TreeNode');
      expect(mapType('Tree<int>', 'python')).toBe('Optional[TreeNode]');
      expect(mapType('Tree<int>', 'cpp')).toBe('TreeNode*');
      expect(mapType('Tree<int>', 'javascript')).toBe('TreeNode');
    });

    test('should correctly map graph types', () => {
      expect(mapType('Graph', 'java')).toBe('int[][]');
      expect(mapType('Graph', 'python')).toBe('List[List[int]]');
      expect(mapType('Graph', 'cpp')).toBe('vector<vector<int>>');
      expect(mapType('Graph', 'javascript')).toBe('number[][]');
    });

    test('should return original type for unmapped types', () => {
      expect(mapType('UnknownType', 'java')).toBe('UnknownType');
    });
  });

  describe('isTypeSupported', () => {
    test('should correctly identify supported types', () => {
      expect(isTypeSupported('int', 'java')).toBe(true);
      expect(isTypeSupported('List<int>', 'python')).toBe(true);
      expect(isTypeSupported('Tree<int>', 'cpp')).toBe(true);
      expect(isTypeSupported('Graph', 'javascript')).toBe(true);
    });

    test('should correctly identify unsupported types', () => {
      expect(isTypeSupported('UnknownType', 'java')).toBe(false);
      expect(isTypeSupported('CustomClass', 'python')).toBe(false);
    });

    test('should return false for unsupported language', () => {
      expect(isTypeSupported('int', 'unsupported')).toBe(false);
    });
  });

  describe('validateTypes', () => {
    test('should return empty array for valid types', () => {
      const parameters = [
        { name: 'nums', type: 'int[]' },
        { name: 'target', type: 'int' }
      ];
      const returns = { type: 'int[]' };
      
      const errors = validateTypes(parameters, returns, 'java');
      expect(errors).toEqual([]);
    });

    test('should return errors for invalid parameter types', () => {
      const parameters = [
        { name: 'nums', type: 'InvalidType' },
        { name: 'target', type: 'int' }
      ];
      const returns = { type: 'int[]' };
      
      const errors = validateTypes(parameters, returns, 'java');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Unsupported parameter type: InvalidType');
    });

    test('should return errors for invalid return types', () => {
      const parameters = [
        { name: 'nums', type: 'int[]' }
      ];
      const returns = { type: 'InvalidReturnType' };
      
      const errors = validateTypes(parameters, returns, 'java');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Unsupported return type: InvalidReturnType');
    });

    test('should return multiple errors for multiple invalid types', () => {
      const parameters = [
        { name: 'param1', type: 'InvalidType1' },
        { name: 'param2', type: 'InvalidType2' }
      ];
      const returns = { type: 'InvalidReturnType' };
      
      const errors = validateTypes(parameters, returns, 'java');
      expect(errors).toHaveLength(3);
    });
  });

  describe('getJSDocType', () => {
    test('should correctly map types to JSDoc annotations', () => {
      expect(getJSDocType('int')).toBe('number');
      expect(getJSDocType('string')).toBe('string');
      expect(getJSDocType('bool')).toBe('boolean');
      expect(getJSDocType('int[]')).toBe('number[]');
      expect(getJSDocType('List<int>')).toBe('number[]');
      expect(getJSDocType('Tree<int>')).toBe('TreeNode');
      expect(getJSDocType('Graph')).toBe('number[][]');
    });

    test('should return original type for unmapped types', () => {
      expect(getJSDocType('UnknownType')).toBe('UnknownType');
    });
  });

  describe('getDefaultReturn', () => {
    test('should generate correct default returns for Python', () => {
      expect(getDefaultReturn('int', 'python')).toBe('return 0');
      expect(getDefaultReturn('str', 'python')).toBe('return ""');
      expect(getDefaultReturn('bool', 'python')).toBe('return False');
      expect(getDefaultReturn('List[int]', 'python')).toBe('return []');
      expect(getDefaultReturn('Optional[TreeNode]', 'python')).toBe('return None');
    });

    test('should generate correct default returns for Java', () => {
      expect(getDefaultReturn('int', 'java')).toBe('return 0;');
      expect(getDefaultReturn('String', 'java')).toBe('return "";');
      expect(getDefaultReturn('boolean', 'java')).toBe('return false;');
      expect(getDefaultReturn('List<Integer>', 'java')).toBe('return {};');
      expect(getDefaultReturn('TreeNode', 'java')).toBe('return null;');
    });

    test('should generate correct default returns for C++', () => {
      expect(getDefaultReturn('int', 'cpp')).toBe('return 0;');
      expect(getDefaultReturn('string', 'cpp')).toBe('return "";');
      expect(getDefaultReturn('bool', 'cpp')).toBe('return false;');
      expect(getDefaultReturn('vector<int>', 'cpp')).toBe('return {};');
      expect(getDefaultReturn('TreeNode*', 'cpp')).toBe('return null;');
    });

    test('should handle edge cases', () => {
      expect(getDefaultReturn('vector<vector<int>>', 'cpp')).toBe('return {};');
      expect(getDefaultReturn('List<List<Integer>>', 'java')).toBe('return {};');
    });
  });

  describe('Integration with complex types', () => {
    test('should handle nested generic types correctly', () => {
      const complexType = 'List<List<int>>';
      
      expect(mapType(complexType, 'java')).toBe('List<List<Integer>>');
      expect(mapType(complexType, 'python')).toBe('List[List[int]]');
      expect(mapType(complexType, 'cpp')).toBe('vector<vector<int>>');
      expect(mapType(complexType, 'javascript')).toBe('number[][]');
    });

    test('should validate complex nested types', () => {
      const parameters = [
        { name: 'matrix', type: 'List<List<int>>' },
        { name: 'queries', type: 'List<int[]>' }
      ];
      const returns = { type: 'List<string>' };
      
      const errors = validateTypes(parameters, returns, 'python');
      expect(errors).toEqual([]);
    });
  });
});