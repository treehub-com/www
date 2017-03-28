module.exports = {
  files: [
    'api/**/*.js',
    {pattern: 'src/**/*.test.js', ignore: true},
  ],
  tests: [
    'api/**/*.test.js',
  ],
  testFramework: 'mocha',
  env: {
    type: 'node',
  },
};
