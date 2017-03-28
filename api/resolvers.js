module.exports = {
  Query: {
    user: require('./query/user.js'),
  },
  Mutation: {
    createUser: require('./mutation/createUser.js'),
  },
  // Types
  User: require('./type/User.js'),
};
