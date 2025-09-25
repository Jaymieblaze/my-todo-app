import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // 1. Ignore the compiled output directory and this config file itself
  {
    ignores: ["lib/", "eslint.config.js"],
  },

  // 2. Basic configuration for JavaScript files
  js.configs.recommended,

  // 3. Configuration for TypeScript files
  ...tseslint.configs.recommended,

  // 4. Custom rules and global settings for Firebase Functions
  {
    languageOptions: {
      globals: {
        ...globals.node, // Use Node.js globals
      },
    },
    rules: {
      "quotes": ["error", "double"],
      "import/no-unresolved": 0,
      "indent": ["error", 2],
      // ## This is the fix: Explicitly configure the rule that was crashing.
      // This prevents it from inheriting a conflicting configuration from the root project.
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { "allowShortCircuit": true, "allowTernary": true }
      ],
    },
  },
];

