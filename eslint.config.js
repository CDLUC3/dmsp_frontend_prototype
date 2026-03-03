const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  // Global ignores
  {
    ignores: [
      "app/dmps/*",
      "generated/graphql.ts",
      "cypress.config.ts",
      "public/tinymce/*",
      "coverage/*",
      "node_modules/**",
      ".next/**",
      "next-env.d.ts",
      "cypress/**",
      "next-env.d.ts",
      "eslint.config.js",
      "scripts/**",
      "__mocks__/"
    ]
  },
  // Main configuration
  ...compat.extends(
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ),
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      "react": require("eslint-plugin-react"),
      "unused-imports": require("eslint-plugin-unused-imports"),
    },
    rules: {
      // JavaScript rules
      "prefer-const": "warn",
      "no-var": "warn",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      "object-shorthand": "warn",
      "quote-props": ["warn", "as-needed"],
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "off",
      "import/no-unresolved": "warn",
      // TypeScript rules
      "@typescript-eslint/array-type": [
        "warn",
        {
          "default": "array"
        }
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
          "assertionStyle": "as",
          "objectLiteralTypeAssertions": "never"
        }
      ]
    },
  },
];