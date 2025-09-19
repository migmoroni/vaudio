module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/src/$1',
  },
  testMatch: [
    '<rootDir>/apps/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/shared/**/*.test.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'apps/**/*.{js,jsx,ts,tsx}',
    'shared/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/apps/mobile/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
