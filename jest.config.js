module.exports = {
  name: 'react-component-benchmark',
  resetMocks: true,
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/scripts/setup-jest.js'],
  testEnvironment: 'jsdom',
};
