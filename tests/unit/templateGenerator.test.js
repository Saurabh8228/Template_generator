const TemplateGeneratorService = require('../../src/services/templateGenerator');
const { fibonacciPayload, lcaPayload, detectCyclePayload } = require('../fixtures/samplePayloads');

describe('TemplateGeneratorService - Unit Tests', () => {
  
  describe('generate method', () => {
    test('should throw error for unsupported language', () => {
      expect(() => {
        TemplateGeneratorService.generate(
          fibonacciPayload.signature,
          'unsupported',
          'test'
        );
      }).toThrow('Unsupported language: unsupported');
    });

    test('should throw error for unsupported types', () => {
      const invalidSignature = {
        function_name: 'test',
        parameters: [{ name: 'param', type: 'InvalidType' }],
        returns: { type: 'int' }
      };

      expect(() => {
        TemplateGeneratorService.generate(invalidSignature, 'python', 'test');
      }).toThrow();
    });
  });

  describe('Java template generation', () => {
    test('should generate correct Java template structure', () => {
      const template = TemplateGeneratorService.generateJavaTemplate(
        fibonacciPayload.signature,
        'fibonacci'
      );

      expect(template).toContain('class Solution {');
      expect(template).toContain('public int fibonacci(int n)');
      expect(template).toContain('public class Main {');
      expect(template).toContain('public static void main(String[] args)');
      expect(template).toContain('return 0;');
    });

    test('should include TreeNode class when needed', () => {
      const template = TemplateGeneratorService.generateJavaTemplate(
        lcaPayload.signature,
        'lca'
      );

      expect(template).toContain('class TreeNode {');
      expect(template).toContain('TreeNode left;');
      expect(template).toContain('TreeNode right;');
    });

    test('should include proper imports', () => {
      const template = TemplateGeneratorService.generateJavaTemplate(
        detectCyclePayload.signature,
        'detect-cycle'
      );

      expect(template).toContain('import java.util.*;');
    });
  });

  describe('Python template generation', () => {
    test('should generate correct Python template structure', () => {
      const template = TemplateGeneratorService.generatePythonTemplate(
        fibonacciPayload.signature,
        'fibonacci'
      );

      expect(template).toContain('class Solution:');
      expect(template).toContain('def fibonacci(self, n: int) -> int:');
      expect(template).toContain('if __name__ == "__main__":');
      expect(template).toContain('return 0');
    });

    test('should include typing imports when needed', () => {
      const template = TemplateGeneratorService.generatePythonTemplate(
        detectCyclePayload.signature,
        'detect-cycle'
      );

      expect(template).toContain('from typing import List');
    });

    test('should include TreeNode class when needed', () => {
      const template = TemplateGeneratorService.generatePythonTemplate(
        lcaPayload.signature,
        'lca'
      );

      expect(template).toContain('class TreeNode:');
      expect(template).toContain('Optional[TreeNode]');
    });
  });

  describe('C++ template generation', () => {
    test('should generate correct C++ template structure', () => {
      const template = TemplateGeneratorService.generateCppTemplate(
        fibonacciPayload.signature,
        'fibonacci'
      );

      expect(template).toContain('class Solution {');
      expect(template).toContain('int fibonacci(int n)');
      expect(template).toContain('int main()');
      expect(template).toContain('using namespace std;');
      expect(template).toContain('return 0;');
    });

    test('should include proper includes', () => {
      const template = TemplateGeneratorService.generateCppTemplate(
        detectCyclePayload.signature,
        'detect-cycle'
      );

      expect(template).toContain('#include <vector>');
      expect(template).toContain('#include <iostream>');
    });

    test('should include TreeNode struct when needed', () => {
      const template = TemplateGeneratorService.generateCppTemplate(
        lcaPayload.signature,
        'lca'
      );

      expect(template).toContain('struct TreeNode {');
      expect(template).toContain('TreeNode *left;');
    });
  });

  describe('JavaScript template generation', () => {
    test('should generate correct JavaScript template structure', () => {
      const template = TemplateGeneratorService.generateJavaScriptTemplate(
        fibonacciPayload.signature,
        'fibonacci'
      );

      expect(template).toContain('var fibonacci = function(n)');
      expect(template).toContain('@param {number} n');
      expect(template).toContain('@return {number}');
      expect(template).toContain('module.exports');
    });

    test('should include TreeNode function when needed', () => {
      const template = TemplateGeneratorService.generateJavaScriptTemplate(
        lcaPayload.signature,
        'lca'
      );

      expect(template).toContain('function TreeNode(val, left, right)');
      expect(template).toContain('@param {TreeNode} root');
    });

    test('should handle complex JSDoc types', () => {
      const template = TemplateGeneratorService.generateJavaScriptTemplate(
        detectCyclePayload.signature,
        'detect-cycle'
      );

      expect(template).toContain('@param {number[][]} graph');
      expect(template).toContain('@return {boolean}');
    });
  });

  describe('Helper methods', () => {
    test('needsTreeNodeDefinition should correctly identify tree types', () => {
      const withTree = [{ type: 'Tree<int>' }];
      const withoutTree = [{ type: 'int[]' }];
      
      expect(TemplateGeneratorService.needsTreeNodeDefinition(withTree, { type: 'int' })).toBe(true);
      expect(TemplateGeneratorService.needsTreeNodeDefinition(withoutTree, { type: 'int' })).toBe(false);
    });

    test('should generate appropriate imports for Java', () => {
      const params = [{ type: 'List<int>' }];
      const returns = { type: 'int' };
      
      const imports = TemplateGeneratorService.getJavaImports(params, returns);
      expect(imports).toContain('import java.util.*;');
    });

    test('should generate appropriate imports for Python', () => {
      const params = [{ type: 'List<int>' }];
      const returns = { type: 'Tree<int>' };
      
      const imports = TemplateGeneratorService.getPythonImports(params, returns);
      expect(imports).toContain('from typing import List, Optional');
    });

    test('should generate appropriate includes for C++', () => {
      const params = [{ type: 'string[]' }];
      const returns = { type: 'int' };
      
      const includes = TemplateGeneratorService.getCppIncludes(params, returns);
      expect(includes).toContain('#include <vector>');
      expect(includes).toContain('#include <string>');
    });
  });

  describe('TreeNode definitions', () => {
    test('should generate correct Java TreeNode', () => {
      const treeNode = TemplateGeneratorService.getJavaTreeNodeDefinition();
      expect(treeNode).toContain('class TreeNode {');
      expect(treeNode).toContain('TreeNode()');
      expect(treeNode).toContain('TreeNode(int val)');
    });

    test('should generate correct Python TreeNode', () => {
      const treeNode = TemplateGeneratorService.getPythonTreeNodeDefinition();
      expect(treeNode).toContain('class TreeNode:');
      expect(treeNode).toContain('def __init__(self');
    });

    test('should generate correct C++ TreeNode', () => {
      const treeNode = TemplateGeneratorService.getCppTreeNodeDefinition();
      expect(treeNode).toContain('struct TreeNode {');
      expect(treeNode).toContain('TreeNode *left;');
    });

    test('should generate correct JavaScript TreeNode', () => {
      const treeNode = TemplateGeneratorService.getJavaScriptTreeNodeDefinition();
      expect(treeNode).toContain('function TreeNode(val, left, right)');
      expect(treeNode).toContain('this.val');
    });
  });
});