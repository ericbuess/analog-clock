module.exports = {
  testMatch: ['**/tests/puppeteer/**/*.test.js'],
  testEnvironment: 'node',
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  setupFilesAfterEnv: [],
  transformIgnorePatterns: [
    "/node_modules/(?!puppeteer)/"
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};