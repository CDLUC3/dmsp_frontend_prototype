import nextJest from "next/jest";
import type { Config } from 'jest'

const createJestConfig = nextJest({
    dir: "./",
});

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
    },
    moduleDirectories: ["node_modules", "<rootDir>/"],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|scss|sass)$': 'identity-obj-proxy',// Added so I can mock CSS imports for layout.tsx
        '^@fontsource/.*$': '<rootDir>/__mocks__/styleMock.js',
        '^@fortawesome/.*$': '<rootDir>/__mocks__/styleMock.js',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        },
        fetch: global.fetch //added this to be able to mock 'fetch' in tests
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "app/**",  // Include all pages
        "components/**"// Include components
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        }
    },
    coverageDirectory: "coverage",
    coverageProvider: 'v8',
    transformIgnorePatterns: [
        'node_modules/(?!(next-intl|other-esm-package)/)',
    ],
}


module.exports = createJestConfig(config);
