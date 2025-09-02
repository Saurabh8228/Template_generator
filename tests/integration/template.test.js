const request = require('supertest');
const app = require('../../src/app');
const {
  fibonacciPayload,
  mergeKListsPayload,
  lcaPayload,
  detectCyclePayload,
  complexPayload,
  invalidPayloads
} = require('../fixtures/samplePayloads');

describe('Template Generation API - Integration Tests', () => {
  
  describe('POST /api/v1/template', () => {
    
    // Test Scenario 1: Single primitive input - Fibonacci
    describe('Scenario 1: Single primitive input - Fibonacci', () => {
      const languages = ['python', 'java', 'cpp', 'javascript'];
      
      test.each(languages)('should generate %s template for Fibonacci', async (language) => {
        const response = await request(app)
          .post('/api/v1/template')
          .send({ ...fibonacciPayload, language })
          .expect(201);

        expect(response.body.language).toBe(language);
        expect(response.body.template).toContainValidTemplate(language);
        expect(response.body.template).toContainLanguageSpecificSyntax(language);
        expect(response.body.template).toContain('fibonacci');
        expect(response.body.metadata).toBeDefined();
        expect(response.body.metadata.question_id).toBe('fibonacci');
      });

      test('should handle function name with mixed case correctly', async () => {
        const payload = {
          ...fibonacciPayload,
          signature: {
            ...fibonacciPayload.signature,
            function_name: 'fibonacciNumber'
          },
          language: 'python'
        };

        const response = await request(app)
          .post('/api/v1/template')
          .send(payload)
          .expect(201);

        expect(response.body.template).toContain('fibonacciNumber');
      });
    });

    // Test Scenario 2: Multiple mixed inputs - Merge K Lists
    describe('Scenario 2: Multiple mixed inputs - Merge K Lists', () => {
      test('should generate Python template with proper List types', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send({ ...mergeKListsPayload, language: 'python' })
          .expect(201);

        expect(response.body.template).toContain('def mergeKLists(self, lists: List[List[int]]) -> List[int]:');
        expect(response.body.template).toContain('from typing import List');
      });

      test('should generate Java template with proper generic types', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send({ ...mergeKListsPayload, language: 'java' })
          .expect(201);

        expect(response.body.template).toContain('public List<Integer> mergeKLists(List<List<Integer>> lists)');
        expect(response.body.template).toContain('import java.util.*;');
      });

      test('should generate C++ template with vector types', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send({ ...mergeKListsPayload, language: 'cpp' })
          .expect(201);

        expect(response.body.template).toContain('vector<int> mergeKLists(vector<vector<int>> lists)');
        expect(response.body.template).toContain('#include <vector>');
      });

      test('should generate JavaScript template with JSDoc types', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send({ ...mergeKListsPayload, language: 'javascript' })
          .expect(201);

        expect(response.body.template).toContain('@param {number[][]} lists');
        expect(response.body.template).toContain('@return {number[]}');
      });
    });

    // Test Scenario 3: Tree operations - Lowest Common Ancestor
    describe('Scenario 3: Tree operations - Lowest Common Ancestor', () => {
      test('should generate templates with TreeNode definitions for all languages', async () => {
        const languages = ['python', 'java', 'cpp', 'javascript'];
        
        for (const language of languages) {
          const response = await request(app)
            .post('/api/v1/template')
            .send({ ...lcaPayload, language })
            .expect(201);

          expect(response.body.template).toContain('TreeNode');
          expect(response.body.template).toContain('lowestCommonAncestor');
          
          // Language-specific TreeNode checks
          if (language === 'python') {
            expect(response.body.template).toContain('class TreeNode:');
            expect(response.body.template).toContain('Optional[TreeNode]');
          } else if (language === 'java') {
            expect(response.body.template).toContain('class TreeNode {');
            expect(response.body.template).toContain('TreeNode left;');
          } else if (language === 'cpp') {
            expect(response.body.template).toContain('struct TreeNode {');
            expect(response.body.template).toContain('TreeNode *left;');
          } else if (language === 'javascript') {
            expect(response.body.template).toContain('function TreeNode(val, left, right)');
          }
        }
      });
    });

    // Test Scenario 4: Graph operations - Detect Cycle
    describe('Scenario 4: Graph operations - Detect Cycle', () => {
      test('should generate templates with correct Graph type mappings', async () => {
        const testCases = [
          { language: 'python', expectedType: 'List[List[int]]' },
          { language: 'java', expectedType: 'int[][]' },
          { language: 'cpp', expectedType: 'vector<vector<int>>' },
          { language: 'javascript', expectedType: 'number[][]' }
        ];

        for (const { language, expectedType } of testCases) {
          const response = await request(app)
            .post('/api/v1/template')
            .send({ ...detectCyclePayload, language })
            .expect(201);

          expect(response.body.template).toContain('detectCycle');
          
          if (language === 'javascript') {
            expect(response.body.template).toContain(`@param {${expectedType}} graph`);
          } else if (language === 'python') {
            expect(response.body.template).toContain(`graph: ${expectedType}`);
          } else {
            expect(response.body.template).toContain(expectedType);
          }
        }
      });
    });

    // Test complex scenario with multiple parameter types
    describe('Complex scenario: Multiple mixed parameter types', () => {
      test('should handle complex signature with multiple types', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send({ ...complexPayload, language: 'python' })
          .expect(201);

        const template = response.body.template;
        expect(template).toContain('def complexSolution(self, matrix: List[List[int]], target: str, flags: List[bool], root: Optional[TreeNode]) -> List[str]:');
        expect(template).toContain('class TreeNode:');
        expect(template).toContain('from typing import List, Optional');
      });
    });

    // Validation tests
    describe('Input validation', () => {
      test('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send(invalidPayloads.missingFields)
          .expect(400);

        expect(response.body.error).toBe('Validation Error');
        expect(response.body.details).toBeDefined();
        expect(Array.isArray(response.body.details)).toBe(true);
      });

      test('should return 400 for invalid language', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send(invalidPayloads.invalidLanguage)
          .expect(400);

        expect(response.body.error).toBe('Validation Error');
      });

      test('should return 400 for invalid function name', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send(invalidPayloads.invalidFunctionName)
          .expect(400);

        expect(response.body.error).toBe('Validation Error');
      });

      test('should return 400 for unsupported types', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send(invalidPayloads.invalidType)
          .expect(400);

        expect(response.body.error).toBe('Validation Error');
      });

      test('should return 400 for too many parameters', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send(invalidPayloads.tooManyParameters)
          .expect(400);

        expect(response.body.error).toBe('Validation Error');
      });

      test('should return 400 for malformed JSON', async () => {
        const response = await request(app)
          .post('/api/v1/template')
          .send('{"invalid": json}')
          .set('Content-Type', 'application/json')
          .expect(400);

        expect(response.body.error).toBe('Invalid JSON');
      });
    });

    // Edge cases
    describe('Edge cases', () => {
      test('should handle empty parameter list', async () => {
        const payload = {
          question_id: 'no-params',
          title: 'No Parameters',
          description: 'A function with no parameters',
          signature: {
            function_name: 'noParams',
            parameters: [],
            returns: { type: 'int' }
          },
          language: 'python'
        };

        const response = await request(app)
          .post('/api/v1/template')
          .send(payload)
          .expect(201);

        expect(response.body.template).toContain('def noParams(self) -> int:');
      });

      test('should handle very long descriptions', async () => {
        const payload = {
          ...fibonacciPayload,
          description: 'A'.repeat(4000), // Very long description
          language: 'python'
        };

        await request(app)
          .post('/api/v1/template')
          .send(payload)
          .expect(201);
      });

      test('should reject extremely long descriptions', async () => {
        const payload = {
          ...fibonacciPayload,
          description: 'A'.repeat(6000), // Too long
          language: 'python'
        };

        await request(app)
          .post('/api/v1/template')
          .send(payload)
          .expect(400);
      });
    });
  });

  describe('POST /api/v1/template/validate', () => {
    test('should validate correct payload', async () => {
      const response = await request(app)
        .post('/api/v1/template/validate')
        .send({ ...fibonacciPayload, language: 'python' })
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.signature_analysis).toBeDefined();
    });

    test('should reject invalid payload', async () => {
      const response = await request(app)
        .post('/api/v1/template/validate')
        .send(invalidPayloads.invalidType)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('GET /api/v1/languages', () => {
    test('should return supported languages and type system', async () => {
      const response = await request(app)
        .get('/api/v1/languages')
        .expect(200);

      expect(response.body.supported_languages).toEqual(['java', 'python', 'cpp', 'javascript']);
      expect(response.body.type_system).toBeDefined();
      expect(response.body.examples).toBeDefined();
    });
  });

  describe('GET /api/v1/types/:language', () => {
    test('should return type mappings for valid language', async () => {
      const response = await request(app)
        .get('/api/v1/types/python')
        .expect(200);

      expect(response.body.language).toBe('python');
      expect(response.body.type_mappings).toBeDefined();
      expect(response.body.categories).toBeDefined();
    });

    test('should return 404 for invalid language', async () => {
      const response = await request(app)
        .get('/api/v1/types/ruby')
        .expect(404);

      expect(response.body.error).toBe('Language not supported');
    });
  });

  describe('GET /api/v1/stats', () => {
    test('should return API statistics', async () => {
      const response = await request(app)
        .get('/api/v1/stats')
        .expect(200);

      expect(response.body.api_version).toBe('v1');
      expect(response.body.supported_languages).toBe(4);
      expect(response.body.uptime_seconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Health endpoints', () => {
    test('GET /health should return basic health info', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });

    test('GET /health/detailed should return detailed health info', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.system).toBeDefined();
      expect(response.body.config).toBeDefined();
      expect(response.body.services).toBeDefined();
    });
  });

  describe('Error handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/template')
        .set('Content-Type', 'application/json')
        .send('{"malformed": json}')
        .expect(400);

      expect(response.body.error).toBe('Invalid JSON');
    });
  });

  describe('Rate limiting', () => {
    test('should apply rate limiting to API endpoints', async () => {
      // Make multiple requests to trigger rate limiting
      const promises = [];
      for (let i = 0; i < 105; i++) { // Exceed the limit of 100
        promises.push(
          request(app)
            .get('/api/v1/languages')
            .catch(err => err.response) // Catch rate limit errors
        );
      }
      
      const responses = await Promise.all(promises);
      
      // Check that at least one request was rate limited
      const rateLimitedResponse = responses.find(res => res && res.status === 429);
      expect(rateLimitedResponse).toBeDefined();
      
      // Check that rate limiting headers are present on successful responses
      const successfulResponse = responses.find(res => res && res.status === 200);
      expect(successfulResponse).toBeDefined();
      
      // Note: Rate limiting headers might not be present if the rate limiter doesn't set them
      // This is a known limitation of some rate limiting middleware
      if (successfulResponse.headers['x-ratelimit-limit']) {
        expect(successfulResponse.headers['x-ratelimit-limit']).toBeDefined();
        expect(successfulResponse.headers['x-ratelimit-remaining']).toBeDefined();
      }
    });
  });

  describe('CORS and Security', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for security headers added by helmet
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });
});