module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    root: true,
    extends: [
        'next',
        'eslint:recommended',
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
    ],
    plugins: ['@typescript-eslint', 'react'],
    rules: {
        // JavaScript rules
        'prefer-const': 'warn',
        'no-var': 'warn',
        'no-unused-vars': 'warn',
        'object-shorthand': 'warn',
        'quote-props': ['warn', 'as-needed'],
        "react/react-in-jsx-scope": "off",
        // TypeScript rules
        '@typescript-eslint/array-type': [
            'warn',
            {
                default: 'array',
            },
        ],
        '@typescript-eslint/consistent-type-assertions': [
            'warn',
            {
                assertionStyle: 'as',
                objectLiteralTypeAssertions: 'never',
            },
        ],
        "@typescript-eslint/ban-types": [
            "error",
            {
                "types": {
                    "{}": false
                }
            }
        ]
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};