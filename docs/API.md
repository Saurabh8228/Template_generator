# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Currently, no authentication is required. In production, consider implementing API key authentication.

## Rate Limiting
- **Limit**: 100 requests per 15-minute window per IP
- **Headers**: Rate limit information is returned in response headers
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when rate limit resets

## Content Type
All endpoints accept and return `application/json` unless otherwise specified.

---

## Endpoints

### 1. Generate Template

Generate a code template for a DSA problem.

**Endpoint:** `POST /api/v1/template`

**Request Body:**
```json
{
  "question_id": "string (required, 1-100 chars, alphanumeric + hyphens/underscores)",
  "title": "string (required, 1-200 chars)",
  "description": "string (required, 1-5000 chars)",
  "signature": {
    "function_name": "string (required, valid identifier)",
    "parameters": [
      {
        "name": "string (required, valid identifier)",
        "type": "string (required, must be supported DSL type)"
      }
    ],
    "returns": {
      "type": "string (required, must be supported DSL type)"
    }
  },
  "language": "string (required, one of: java, python, cpp, javascript)"
}
```

**Success Response (201):**
```json
{
  "language": "python",
  "template": "# Generated template code...",
  "metadata": {
    "question_id": "two-sum",
    "title": "Two Sum",
    "function_name": "twoSum",
    "parameter_count": 2,
    "generated_at": "2025-09-01T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation error or unsupported types
- `413`: Payload too large
- `429`: Rate limit exceeded
- `500`: Internal server error

---

### 2. Validate Template

Validate template generation parameters without actually generating the template (dry run).

**Endpoint:** `POST /api/v1/template/validate`

**Request Body:** Same as generate template

**Success Response (200):**
```json
{
  "valid": true,
  "message": "Template can be generated successfully",
  "signature_analysis": {
    "function_name": "twoSum",
    "parameter_count": 2,
    "return_type": "int[]",
    "language_mapping": {
      "parameters": [
        {
          "name": "nums",
          "dsl_type": "int[]",
          "mapped_type": "List[int]"
        },
        {
          "name": "target",
          "dsl_type": "int",
          "mapped_type": "int"
        }
      ],
      "return_type": {
        "dsl_type": "int[]",
        "mapped_type": "List[int]"
      }
    }
  }
}
```

**Error Response (400):**
```json
{
  "valid": false,
  "errors": [
    "Unsupported parameter type: InvalidType for language: python"
  ]
}
```

---

### 3. Get Supported Languages

Get list of supported programming languages and type system information.

**Endpoint:** `GET /api/v1/languages`

**Response (200):**
```json
{
  "supported_languages": ["java", "python", "cpp", "javascript"],
  "type_system": {
    "primitives": ["int", "long", "float", "double", "bool", "string"],
    "collections": ["T[]", "List<T>"],
    "special": ["Tree<T>", "Graph"]
  },
  "examples": {
    "primitives": ["int", "string", "bool"],
    "arrays": ["int[]", "string[]"],
    "lists": ["List<int>", "List<string>", "List<List<int>>"],
    "trees": ["Tree<int>", "Tree<string>"],
    "graphs": ["Graph"]
  }
}
```

---

### 4. Get Type Mappings

Get type mappings for a specific programming language.

**Endpoint:** `GET /api/v1/types/{language}`

**Parameters:**
- `language` (path): One of `java`, `python`, `cpp`, `javascript`

**Response (200):**
```json
{
  "language": "python",
  "type_mappings": {
    "int": "int",
    "string": "str",
    "int[]": "List[int]",
    "List<int>": "List[int]",
    "Tree<int>": "Optional[TreeNode]",
    "Graph": "List[List[int]]"
  },
  "total_types": 25,
  "categories": {
    "primitives": {
      "int": "int",
      "string": "str",
      "bool": "bool"
    },
    "collections": {
      "int[]": "List[int]",
      "List<int>": "List[int]"
    },
    "special": {
      "Tree<int>": "Optional[TreeNode]",
      "Graph": "List[List[int]]"
    }
  }
}
```

**Error Response (404):**
```json
{
  "error": "Language not supported",
  "supported_languages": ["java", "python", "cpp", "javascript"]
}
```

---

### 5. Get API Statistics

Get API statistics and system information.

**Endpoint:** `GET /api/v1/stats`

**Response (200):**
```json
{
  "api_version": "v1",
  "supported_languages": 4,
  "total_supported_types": 25,
  "uptime_seconds": 3600,
  "memory_usage": {
    "rss": 45678592,
    "heapTotal": 25165824,
    "heapUsed": 18943936,
    "external": 1445328
  },
  "node_version": "v18.17.0",
  "last_updated": "2025-09-01T10:30:00.000Z"
}
```

---

## Health Check Endpoints

### Basic Health Check
**Endpoint:** `GET /health`
```json
{
  "status": "healthy",
  "timestamp": "2025-09-01T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

### Detailed Health Check
**Endpoint:** `GET /health/detailed`
```json
{
  "status": "healthy",
  "timestamp": "2025-09-01T10:30:00.000Z",
  "system": {
    "uptime": 3600,
    "memory": {
      "rss": "44 MB",
      "heapTotal": "24 MB",
      "heapUsed": "18 MB",
      "external": "1 MB"
    },
    "node_version": "v18.17.0",
    "platform": "linux",
    "arch": "x64"
  },
  "config": {
    "environment": "development",
    "supported_languages": ["java", "python", "cpp", "javascript"],
    "api_version": "v1"
  },
  "services": {
    "template_generator": "operational",
    "type_mapper": "operational",
    "validation": "operational"
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [] // Optional: Array of detailed error information
}
```

### Common Error Types

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Validation Error | Invalid input data |
| 400 | Type Validation Error | Unsupported type for language |
| 400 | Invalid JSON | Malformed JSON in request body |
| 404 | Endpoint not found | Invalid API endpoint |
| 413 | Payload Too Large | Request body exceeds size limit |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Internal Server Error | Unexpected server error |

---

## Type System Reference

### Primitive Types
- `int`: 32-bit signed integer
- `long`: 64-bit signed integer  
- `float`: IEEE-754 32-bit float
- `double`: IEEE-754 64-bit double
- `bool`: Boolean value
- `string`: UTF-8 string

### Collection Types
- `T[]`: Dynamic array of type T
- `List<T>`: Generic list/vector of type T

### Special Types
- `Tree<T>`: Binary tree node with value of type T
- `Graph`: Adjacency list representation (List<List<int>>)

### Language-Specific Mappings

| DSL Type | Java | Python | C++ | JavaScript |
|----------|------|--------|-----|------------|
| `int` | `int` | `int` | `int` | `number` |
| `string` | `String` | `str` | `string` | `string` |
| `bool` | `boolean` | `bool` | `bool` | `boolean` |
| `int[]` | `int[]` | `List[int]` | `vector<int>` | `number[]` |
| `List<int>` | `List<Integer>` | `List[int]` | `vector<int>` | `number[]` |
| `Tree<int>` | `TreeNode` | `Optional[TreeNode]` | `TreeNode*` | `TreeNode` |
| `Graph` | `int[][]` | `List[List[int]]` | `vector<vector<int>>` | `number[][]` |

---

## Examples

### Complete Example: Two Sum Problem

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/template \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "two-sum",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "signature": {
      "function_name": "twoSum",
      "parameters": [
        { "name": "nums", "type": "int[]" },
        { "name": "target", "type": "int" }
      ],
      "returns": { "type": "int[]" }
    },
    "language": "java"
  }'
```

**Generated Java Template:**
```java
import java.util.*;
import java.util.Scanner;
import com.google.gson.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your logic here
        return {};
    }
}

public class Main {
    public static void main(String[] args) {
        // Do not edit below this line
        Scanner scanner = new Scanner(System.in);
        StringBuilder input = new StringBuilder();
        while (scanner.hasNextLine()) {
            input.append(scanner.nextLine());
        }
        
        try {
            // Parse JSON input and call solution
            Gson gson = new Gson();
            JsonObject jsonInput = gson.fromJson(input.toString(), JsonObject.class);
            
            Solution solution = new Solution();
            // Dynamic method invocation would be implemented here
            // Object result = solution.twoSum(...);
            // System.out.println(gson.toJson(result));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}
```

### Binary Tree Example

**Request for Tree Problem:**
```json
{
  "question_id": "validate-bst",
  "title": "Validate Binary Search Tree",
  "description": "Determine if a binary tree is a valid binary search tree",
  "signature": {
    "function_name": "isValidBST",
    "parameters": [
      { "name": "root", "type": "Tree<int>" }
    ],
    "returns": { "type": "bool" }
  },
  "language": "python"
}
```

**Generated Python Template:**
```python
from typing import List, Optional

# Definition for a binary tree node
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        # Write your logic here
        return False

if __name__ == "__main__":
    # Do not edit below this line
    import sys
    import json
    
    try:
        data = json.loads(sys.stdin.read())
        solution = Solution()
        result = solution.isValidBST(data["root"])
        print(json.dumps(result, default=str))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
```

---

## Testing the API

### Using curl

```bash
# Test basic functionality
curl -X GET http://localhost:3000/health

# Get supported languages
curl -X GET http://localhost:3000/api/v1/languages

# Generate a simple template
curl -X POST http://localhost:3000/api/v1/template \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "simple-test",
    "title": "Simple Test",
    "description": "A simple test function",
    "signature": {
      "function_name": "simpleTest",
      "parameters": [{"name": "x", "type": "int"}],
      "returns": {"type": "int"}
    },
    "language": "python"
  }'
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

async function generateTemplate() {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/template', {
      question_id: 'two-sum',
      title: 'Two Sum',
      description: 'Find two numbers that add up to target',
      signature: {
        function_name: 'twoSum',
        parameters: [
          { name: 'nums', type: 'int[]' },
          { name: 'target', type: 'int' }
        ],
        returns: { type: 'int[]' }
      },
      language: 'python'
    });
    
    console.log('Generated template:');
    console.log(response.data.template);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

generateTemplate();
```

### Using Python

```python
import requests
import json

def generate_template():
    url = 'http://localhost:3000/api/v1/template'
    payload = {
        'question_id': 'fibonacci',
        'title': 'Fibonacci Number',
        'description': 'Calculate the nth fibonacci number',
        'signature': {
            'function_name': 'fibonacci',
            'parameters': [{'name': 'n', 'type': 'int'}],
            'returns': {'type': 'int'}
        },
        'language': 'java'
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        print('Generated template:')
        print(result['template'])
        
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    generate_template()
```

---

## Performance Considerations

### Response Times
- Simple templates (primitives only): < 50ms
- Complex templates (with TreeNode/Graph): < 100ms
- Validation only: < 20ms

### Memory Usage
- Baseline memory usage: ~25MB
- Per request overhead: ~1KB
- Template size: Typically 500-2000 characters

### Scalability
- Stateless design allows horizontal scaling
- No database dependencies
- CPU-bound operations are minimal
- Suitable for container orchestration (Kubernetes, Docker Swarm)

---

## Integration Examples

### LeetCode-style Platform Integration

```javascript
// Example integration for a coding platform
class CodingPlatform {
  constructor(apiBaseUrl) {
    this.apiUrl = apiBaseUrl;
  }
  
  async createProblem(problemData, language) {
    const templateRequest = {
      question_id: problemData.id,
      title: problemData.title,
      description: problemData.description,
      signature: problemData.signature,
      language: language
    };
    
    const response = await fetch(`${this.apiUrl}/api/v1/template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateRequest)
    });
    
    if (!response.ok) {
      throw new Error(`Template generation failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.template;
  }
}

// Usage
const platform = new CodingPlatform('http://localhost:3000');
const template = await platform.createProblem(problemData, 'python');
```

### Batch Template Generation

```javascript
async function generateMultipleTemplates(problemSignature, languages) {
  const promises = languages.map(language => 
    fetch('/api/v1/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...problemSignature,
        language
      })
    }).then(res => res.json())
  );
  
  const results = await Promise.all(promises);
  return results.reduce((acc, result) => {
    acc[result.language] = result.template;
    return acc;
  }, {});
}
```

---

## Troubleshooting

### Common Issues

**1. Template Generation Fails**
- Check if all types in signature are supported
- Verify function name follows identifier rules
- Ensure language is one of the supported languages

**2. Validation Errors**
- Review the error details in the response
- Check parameter names are valid identifiers
- Verify question_id contains only allowed characters

**3. Rate Limiting**
- Implement exponential backoff for retries
- Cache templates when possible
- Use batch validation endpoint for multiple checks

**4. Performance Issues**
- Enable compression in production
- Use keep-alive connections
- Implement client-side caching for language metadata

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed error stack traces
- Extended logging
- Additional debug information in responses

### Monitoring

Recommended metrics to monitor:
- Request rate and response times
- Error rates by endpoint
- Memory usage and CPU utilization
- Template generation success rate
- Most requested languages and types