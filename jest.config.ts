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
  // Add coverage path ignore patterns to exclude server actions
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/app/actions/",         // Exclude server actions in app/actions
    "/actions/",             // Exclude server actions if in root actions folder
    "<rootDir>/app/\\[locale\\]/styleguide/sg-components.tsx", // Exclude style guide
    "<rootDir>/app/\\[locale\\]/styleguide/page.tsx", // Exclude style guide
    "<rootDir>/app/types/index.ts", // Exclude types
    "<rootDir>/app/\\[locale\\]/healthcheck/page.tsx", // Exclude health check
    ".*\\.server\\.(js|ts|tsx)$"  // Optional: Exclude files ending with .server.ts etc.
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    }
  },
  coverageDirectory: "coverage",
  coverageProvider: 'v8',
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|other-esm-package)/)',
  ],
}


module.exports = createJestConfig(config);
