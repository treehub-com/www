module.exports = {
  files: [
    'api/**/*.js',
    'lib/**/*.js',
    'email/**/*.js',
    'test/**/*',
    {pattern: 'api/**/*.test.js', ignore: true},
  ],
  tests: [
    'api/**/*.test.js',
  ],
  testFramework: 'mocha',
  env: {
    type: 'node',
  },
  workers: {
    initial: 1,
    regular: 1,
    recycle: true
  },
};
