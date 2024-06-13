const nextJest = require("next/jest");
import type { Config } from 'jest'
const createJestConfig = nextJest({
    dir: "./",
});

const config: Config = {
    collectCoverage: true,
    coverageProvider: 'v8',
    coverageDirectory: "coverage",
    testEnvironment: "jest-environment-jsdom",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
    },
    moduleDirectories: ["node_modules", "<rootDir>/"],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        },
        'fetch': global.fetch //added this to be able to mock 'fetch' in tests
    },
}


module.exports = createJestConfig(config);
