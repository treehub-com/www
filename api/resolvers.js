module.exports = {
  Query: {
    package: require('./query/package.js'),
    tokens: require('./query/tokens.js'),
    user: require('./query/user.js'),
  },
  Mutation: {
    createCode: require('./mutation/createCode.js'),
    createPackage: require('./mutation/createPackage.js'),
    createToken: require('./mutation/createToken.js'),
    createUser: require('./mutation/createUser.js'),
  },
  // Types
  Error: require('./type/Error.js'),
  Package: require('./type/Package.js'),
  Token: require('./type/Token.js'),
  User: require('./type/User.js'),
};
