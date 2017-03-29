module.exports = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    user(id: ID login: String): User
    tokens: [Token!]!
  }`,
  // Mutations
  `type Mutation {
    createCode(input: CodeCreateInput): String!
    createToken(input: TokenCreateInput): String!
    createUser(input: UserCreateInput): User
  }`,
  // Types
  `type Token {
    id: Int!
    userId: Int!
    # Only set when returned from createToken
    token: String
    # Shows the last 7 characters
    redactedToken: String!
    description: String!
    created: String!
    expires: String!
  }`,
  `type User {
    id: Int!
    username: String!
    # Redacted unless requesting your own information
    email: String
    created: String!
  }`,
  // Inputs
  `input CodeCreateInput {
    login: String!
  }`,
  `input TokenCreateInput {
    code: String!
    description: String
    expires: String
  }`,
  `input UserCreateInput {
    username: String!
    email: String!
  }`,
];
