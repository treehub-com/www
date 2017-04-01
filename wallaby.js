module.exports = {
  files: [
    'api/**/*.js',
    'lib/**/*.js',
    'email/**/*.js',
    {pattern: 'api/**/*.test.js', ignore: true},
  ],
  tests: [
    'api/**/*.test.js',
  ],
  testFramework: 'mocha',
  env: {
    type: 'node',
  },
};
