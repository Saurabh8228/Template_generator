const { mapType, validateTypes, getJSDocType, getDefaultReturn } = require('../utils/typeMappers');

/**
 * Template Generator Service
 * Generates code templates for different programming languages
 */
class TemplateGeneratorService {
  
  /**
   * Generate Java template
   */
  static generateJavaTemplate(signature, questionId) {
    const { function_name, parameters, returns } = signature;
    
    // Map parameter types and create parameter list
    const paramList = parameters.map(param => {
      const javaType = mapType(param.type, 'java');
      return `${javaType} ${param.name}`;
    }).join(', ');
    
    // Map return type
    const returnType = mapType(returns.type, 'java');
    
    // Determine required imports
    const imports = this.getJavaImports(parameters, returns);
    const importStatements = imports.length > 0 ? `${imports.join('\n')  }\n` : '';
    
    // Check if TreeNode definition is needed
    const needsTreeNode = this.needsTreeNodeDefinition(parameters, returns);
    const treeNodeDef = needsTreeNode ? this.getJavaTreeNodeDefinition() : '';
    
    // Generate default return statement
    const defaultReturn = getDefaultReturn(returnType, 'java');
    
    return `${importStatements}${treeNodeDef}class Solution {
    public ${returnType} ${function_name}(${paramList}) {
        // Write your logic here
        ${defaultReturn}
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
            // Object result = solution.${function_name}(...);
            // System.out.println(gson.toJson(result));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}`.trim();
  }

  /**
   * Generate Python template
   */
  static generatePythonTemplate(signature, questionId) {
    const { function_name, parameters, returns } = signature;
    
    // Map parameter types and create parameter list
    const paramList = parameters.map(param => {
      const pythonType = mapType(param.type, 'python');
      return `${param.name}: ${pythonType}`;
    }).join(', ');
    
    // Map return type
    const returnType = mapType(returns.type, 'python');
    
    // Determine required imports
    const imports = this.getPythonImports(parameters, returns);
    const importStatements = imports.length > 0 ? `${imports.join('\n')  }\n` : '';
    
    // Check if TreeNode definition is needed
    const needsTreeNode = this.needsTreeNodeDefinition(parameters, returns);
    const treeNodeDef = needsTreeNode ? this.getPythonTreeNodeDefinition() : '';
    
    // Generate default return
    const defaultReturn = getDefaultReturn(returnType, 'python');
    
    // Create parameter list for function call
    const paramNames = parameters.map(p => p.name).join(', ');
    
    return `${importStatements}${treeNodeDef}class Solution:
    def ${function_name}(self${paramList ? `, ${  paramList}` : ''}) -> ${returnType}:
        # Write your logic here
        ${defaultReturn}

if __name__ == "__main__":
    # Do not edit below this line
    import sys
    import json
    
    try:
        data = json.loads(sys.stdin.read())
        solution = Solution()
        result = solution.${function_name}(${paramNames.split(', ').map(name => `data["${name}"]`).join(', ')})
        print(json.dumps(result, default=str))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)`.trim();
  }

  /**
   * Generate C++ template
   */
  static generateCppTemplate(signature, questionId) {
    const { function_name, parameters, returns } = signature;
    
    // Map parameter types and create parameter list
    const paramList = parameters.map(param => {
      const cppType = mapType(param.type, 'cpp');
      return `${cppType} ${param.name}`;
    }).join(', ');
    
    // Map return type
    const returnType = mapType(returns.type, 'cpp');
    
    // Determine required includes
    const includes = this.getCppIncludes(parameters, returns);
    const includeStatements = `${includes.join('\n')  }\n`;
    
    // Check if TreeNode definition is needed
    const needsTreeNode = this.needsTreeNodeDefinition(parameters, returns);
    const treeNodeDef = needsTreeNode ? this.getCppTreeNodeDefinition() : '';
    
    // Generate default return
    const defaultReturn = getDefaultReturn(returnType, 'cpp');
    
    return `${includeStatements}${treeNodeDef}using namespace std;

class Solution {
public:
    ${returnType} ${function_name}(${paramList}) {
        // Write your logic here
        ${defaultReturn}
    }
};

int main() {
    // Do not edit below this line
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // JSON parsing and solution calling would be implemented here
    // For now, this is a basic structure
    Solution solution;
    
    return 0;
}`.trim();
  }

  /**
   * Generate JavaScript template
   */
  static generateJavaScriptTemplate(signature, questionId) {
    const { function_name, parameters, returns } = signature;
    
    // Parameter list for JavaScript (no types in function signature)
    const paramList = parameters.map(param => param.name).join(', ');
    
    // Create JSDoc parameter annotations
    const jsDocParams = parameters.map(param => {
      const jsType = getJSDocType(param.type);
      return ` * @param {${jsType}} ${param.name}`;
    }).join('\n');
    
    // Create JSDoc return annotation
    const jsDocReturn = ` * @return {${getJSDocType(returns.type)}}`;
    
    // Check if TreeNode definition is needed
    const needsTreeNode = this.needsTreeNodeDefinition(parameters, returns);
    const treeNodeDef = needsTreeNode ? this.getJavaScriptTreeNodeDefinition() : '';
    
    // Create parameter extraction for main execution
    const paramExtraction = parameters.map(param => `data.${param.name}`).join(', ');
    
    return `${treeNodeDef}/**
${jsDocParams}
${jsDocReturn}
 */
var ${function_name} = function(${paramList}) {
    // Write your logic here
    
};

// Do not edit below this line
if (typeof module !== 'undefined' && module.exports) {
    const fs = require('fs');
    
    try {
        const input = fs.readFileSync(0, 'utf8');
        const data = JSON.parse(input);
        const result = ${function_name}(${paramExtraction});
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}`.trim();
  }

  /**
   * Main generation method - orchestrates template generation
   */
  static generate(signature, language, questionId) {
    // Check language support first
    if (!['java', 'python', 'cpp', 'javascript'].includes(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Validate types after language check
    const typeErrors = validateTypes(signature.parameters, signature.returns, language);
    if (typeErrors.length > 0) {
      const error = new Error(typeErrors.join('; '));
      error.isTypeValidation = true;
      throw error;
    }

    switch (language) {
    case 'java':
      return this.generateJavaTemplate(signature, questionId);
    case 'python':
      return this.generatePythonTemplate(signature, questionId);
    case 'cpp':
      return this.generateCppTemplate(signature, questionId);
    case 'javascript':
      return this.generateJavaScriptTemplate(signature, questionId);
    default:
      throw new Error(`Unsupported language: ${language}`);
    }
  }

  /**
   * Helper methods for determining required imports/includes
   */
  static getJavaImports(parameters, returns) {
    const imports = new Set(['import java.util.*;', 'import java.util.Scanner;']);
    const allTypes = [...parameters.map(p => p.type), returns.type];
    
    if (allTypes.some(type => type.includes('List'))) {
      imports.add('import java.util.*;');
    }
    
    // Add Gson for JSON handling
    imports.add('import com.google.gson.*;');
    
    return Array.from(imports);
  }

  static getPythonImports(parameters, returns) {
    const imports = new Set();
    const allTypes = [...parameters.map(p => p.type), returns.type];
    
    // Always add typing imports if we have complex types
    if (allTypes.some(type => type.includes('List') || type.includes('Tree'))) {
      imports.add('from typing import List, Optional');
    }
    
    // Also add typing imports for simple types to ensure consistency
    if (allTypes.some(type => type.includes('int') || type.includes('str') || type.includes('bool'))) {
      imports.add('from typing import List, Optional');
    }
    
    return Array.from(imports);
  }

  static getCppIncludes(parameters, returns) {
    const includes = new Set([
      '#include <iostream>',
      '#include <vector>',
      '#include <string>',
      '#include <algorithm>'
    ]);
    
    const allTypes = [...parameters.map(p => p.type), returns.type];
    
    if (allTypes.some(type => type.includes('Tree'))) {
      includes.add('#include <memory>');
    }
    
    if (allTypes.some(type => type.includes('string'))) {
      includes.add('#include <string>');
    }
    
    return Array.from(includes);
  }

  /**
   * Check if TreeNode definition is needed
   */
  static needsTreeNodeDefinition(parameters, returns) {
    const allTypes = [...parameters.map(p => p.type), returns.type];
    return allTypes.some(type => type.includes('Tree'));
  }

  /**
   * TreeNode definitions for different languages
   */
  static getJavaTreeNodeDefinition() {
    return `
// Definition for a binary tree node
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

`;
  }

  static getPythonTreeNodeDefinition() {
    return `
# Definition for a binary tree node
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

`;
  }

  static getCppTreeNodeDefinition() {
    return `
// Definition for a binary tree node
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

`;
  }

  static getJavaScriptTreeNodeDefinition() {
    return `// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

`;
  }
}

module.exports = TemplateGeneratorService;