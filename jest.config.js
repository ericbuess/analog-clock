export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.jsx'],
  moduleNameMapper: {
    '^.+\\.svg$': '<rootDir>/tests/mocks/svgMock.js',
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};