/**
 * Sample test payloads for different scenarios
 */

// Scenario 1: Single primitive input - Fibonacci
const fibonacciPayload = {
  question_id: 'fibonacci',
  title: 'Fibonacci Number',
  description: 'Given an integer n, return the nth fibonacci number',
  signature: {
    function_name: 'fibonacci',
    parameters: [
      { name: 'n', type: 'int' }
    ],
    returns: { type: 'int' }
  }
};

// Scenario 2: Multiple mixed inputs - Merge K Lists
const mergeKListsPayload = {
  question_id: 'merge-k-lists',
  title: 'Merge K Sorted Lists',
  description: 'Merge k sorted linked lists and return it as one sorted list',
  signature: {
    function_name: 'mergeKLists',
    parameters: [
      { name: 'lists', type: 'List<List<int>>' }
    ],
    returns: { type: 'List<int>' }
  }
};

// Scenario 3: Custom object & multiple returns - Tree operations
const lcaPayload = {
  question_id: 'lowest-common-ancestor',
  title: 'Lowest Common Ancestor',
  description: 'Find the lowest common ancestor of two nodes in a binary tree',
  signature: {
    function_name: 'lowestCommonAncestor',
    parameters: [
      { name: 'root', type: 'Tree<int>' },
      { name: 'p', type: 'Tree<int>' },
      { name: 'q', type: 'Tree<int>' }
    ],
    returns: { type: 'Tree<int>' }
  }
};

// Scenario 4: Graph input - Detect Cycle
const detectCyclePayload = {
  question_id: 'detect-cycle',
  title: 'Detect Cycle in Graph',
  description: 'Detect if there is a cycle in a directed graph',
  signature: {
    function_name: 'detectCycle',
    parameters: [
      { name: 'graph', type: 'Graph' }
    ],
    returns: { type: 'bool' }
  }
};

// Complex scenario: Multiple parameters with mixed types
const complexPayload = {
  question_id: 'complex-problem',
  title: 'Complex Problem',
  description: 'A problem with multiple parameter types',
  signature: {
    function_name: 'complexSolution',
    parameters: [
      { name: 'matrix', type: 'List<List<int>>' },
      { name: 'target', type: 'string' },
      { name: 'flags', type: 'bool[]' },
      { name: 'root', type: 'Tree<int>' }
    ],
    returns: { type: 'List<string>' }
  }
};

// Invalid payloads for testing validation
const invalidPayloads = {
  missingFields: {
    question_id: 'test'
    // Missing required fields
  },
  
  invalidLanguage: {
    question_id: 'test',
    title: 'Test',
    description: 'Test description',
    signature: {
      function_name: 'test',
      parameters: [],
      returns: { type: 'int' }
    },
    language: 'ruby' // Unsupported language
  },
  
  invalidFunctionName: {
    question_id: 'test',
    title: 'Test',
    description: 'Test description',
    signature: {
      function_name: '123invalid', // Invalid function name
      parameters: [],
      returns: { type: 'int' }
    },
    language: 'python'
  },
  
  invalidType: {
    question_id: 'test',
    title: 'Test',
    description: 'Test description',
    signature: {
      function_name: 'test',
      parameters: [
        { name: 'param', type: 'UnsupportedType' }
      ],
      returns: { type: 'int' }
    },
    language: 'python'
  },
  
  tooManyParameters: {
    question_id: 'test',
    title: 'Test',
    description: 'Test description',
    signature: {
      function_name: 'test',
      parameters: Array.from({ length: 25 }, (_, i) => ({
        name: `param${i}`,
        type: 'int'
      })),
      returns: { type: 'int' }
    },
    language: 'python'
  }
};

module.exports = {
  fibonacciPayload,
  mergeKListsPayload,
  lcaPayload,
  detectCyclePayload,
  complexPayload,
  invalidPayloads
};