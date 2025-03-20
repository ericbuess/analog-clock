export default {
  testEnvironment: 'jsdom',
  transform: {},
  extensionsToTreatAsEsm: ['.jsx', '.js'],
  moduleNameMapper: {
    '^.+\\.svg$': '<rootDir>/tests/mocks/svgMock.js',
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};