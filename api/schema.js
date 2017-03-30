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
    createCode(input: CodeCreateInput!): CodeCreateResponse!
    createToken(input: TokenCreateInput!): TokenCreateResponse!
    createUser(input: UserCreateInput!): UserCreateResponse!
  }`,
  // Types
  `type Error {
    # The input field of the error, if any
    key: String
    # The error message, suitable for display
    message: String!
  }`,
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
  // Inputs & Responses
  `input CodeCreateInput {
    login: String!
  }`,
  `type CodeCreateResponse {
    message: String
    errors: [Error]!
  }`,
  `input TokenCreateInput {
    code: String!
    description: String
    expires: String
  }`,
  `type TokenCreateResponse {
    token: Token
    errors: [Error]!
  }`,
  `input UserCreateInput {
    username: String!
    email: String!
  }`,
  `type UserCreateResponse {
    user: User
    errors: [Error]!
  }`,
];
