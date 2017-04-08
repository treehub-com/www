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
    params: {
      // Wallaby doesn't escape env vars, so we manually set this to blank
      env: 'GCLOUD_STORAGE_CREDENTIALS='
    }
  },
  workers: {
    initial: 1,
    regular: 1,
    recycle: true
  },
};
