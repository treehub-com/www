module.exports = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    user(id: ID login: String): User
  }`,
  // Mutations
  `type Mutation {
    createUser(input: UserCreateInput): User
  }`,
  // Types
  `type User {
    id: Int!
    username: String!
    email: String
    created: String!
  }`,
  // Inputs
  `input UserCreateInput {
    username: String!
    email: String!
  }`,
];
