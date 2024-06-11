const nextJest = require("next/jest");
const createJestConfig = nextJest({
    dir: "./",
});

const customJestConfig = {
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
};
module.exports = createJestConfig(customJestConfig);
