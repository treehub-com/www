module.exports = {
  Query: {
    tokens: require('./query/tokens.js'),
    user: require('./query/user.js'),
  },
  Mutation: {
    createUser: require('./mutation/createUser.js'),
  },
  // Types
  Token: require('./type/Token.js'),
  User: require('./type/User.js'),
};
