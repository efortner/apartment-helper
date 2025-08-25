export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.(ts|js)'],
  roots: ['<rootDir>/src'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/errors/',
    'index.ts',
    '\\.guard\\.ts$',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
