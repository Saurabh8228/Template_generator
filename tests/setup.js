// Test setup and configuration
const config = require('../src/config');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Let the system assign a random port for tests

// Mock console.log/error in tests to reduce noise
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  };
}

// Global test timeout
jest.setTimeout(30000);

// Custom matchers
expect.extend({
  toContainValidTemplate(received, language) {
    // Check for basic validity
    if (!received || typeof received !== 'string' || received.length === 0) {
      return {
        message: () => `expected ${received} to be a valid template`,
        pass: false,
      };
    }
    
    // Check for problematic patterns that indicate template generation issues
    // Allow "undefined" and "null" as they can be valid in generated code
    const problematicPatterns = [
      'undefinedundefined',  // Double undefined (likely a bug)
      'nullnull',            // Double null (likely a bug)
      'undefinednull',       // Undefined followed by null (likely a bug)
      'nullundefined'        // Null followed by undefined (likely a bug)
    ];
    
    const hasProblematicPattern = problematicPatterns.some(pattern => received.includes(pattern));
    
    if (hasProblematicPattern) {
      return {
        message: () => `expected ${received} to be a valid template`,
        pass: false,
      };
    }
    
    return {
      message: () => `expected ${received} not to be a valid template`,
      pass: true,
    };
  },

  toContainLanguageSpecificSyntax(received, language) {
    const syntaxChecks = {
      java: ['class Solution', 'public'],
      python: ['class Solution:', 'def '],
      cpp: ['class Solution', 'using namespace std'],
      javascript: ['var ', '= function(']
    };
    
    const expectedSyntax = syntaxChecks[language] || [];
    const pass = expectedSyntax.every(syntax => received.includes(syntax));
    
    if (pass) {
      return {
        message: () => `expected ${received} not to contain ${language} syntax`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to contain ${language} syntax: ${expectedSyntax.join(', ')}`,
        pass: false,
      };
    }
  }
});

// Global test utilities
global.testUtils = {
  /**
   * Create a test payload with default values
   */
  createTestPayload(overrides = {}) {
    return {
      question_id: 'test-problem',
      title: 'Test Problem',
      description: 'A test problem for unit testing',
      signature: {
        function_name: 'testFunction',
        parameters: [
          { name: 'input', type: 'int' }
        ],
        returns: { type: 'int' }
      },
      language: 'python',
      ...overrides
    };
  },

  /**
   * Check if template contains required boilerplate
   */
  hasRequiredBoilerplate(template, language) {
    const boilerplateChecks = {
      java: ['class Solution', 'public class Main', 'public static void main'],
      python: ['class Solution:', 'if __name__ == "__main__":'],
      cpp: ['class Solution', 'int main()'],
      javascript: ['var ', '= function(', 'module.exports']
    };
    
    const required = boilerplateChecks[language] || [];
    return required.every(check => template.includes(check));
  }
};

module.exports = {};