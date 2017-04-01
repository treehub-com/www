module.exports = {
  Query: {
    tokens: require('./query/tokens.js'),
    user: require('./query/user.js'),
  },
  Mutation: {
    createCode: require('./mutation/createCode.js'),
    createToken: require('./mutation/createToken.js'),
    createUser: require('./mutation/createUser.js'),
  },
  // Types
  Error: require('./type/Error.js'),
  Token: require('./type/Token.js'),
  User: require('./type/User.js'),
};
