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
    createUser(input: UserCreateInput): User
    createCode(input: CodeCreateInput): Boolean
    createToken(input: TokenCreateInput): String!
  }`,
  // Types
  `type User {
    id: Int!
    username: String!
    # Redacted unless requesting your own information
    email: String
    created: String!
  }`,
  `type Token {
    id: Int!
    # Only set when returned from createToken
    token: String
    # Shows the last 7 characters
    redactedToken: String
    description: String!
    expires: String!
  }`,
  // Inputs
  `input UserCreateInput {
    username: String!
    email: String!
  }`,
  `input CodeCreateInput {
    login: String!
  }`,
  `input TokenCreateInput {
    code: String!
    description: String
    expires: String
  }`,
];
