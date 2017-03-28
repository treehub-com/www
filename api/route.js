const {graphql} = require('graphql');
const {makeExecutableSchema} = require('graphql-tools');

const schema = makeExecutableSchema({
  typeDefs: require('./schema.js'),
  resolvers: require('./resolvers.js'),
});

function request({query, variables, operationName}) {
  return graphql(
    schema,
    query,
    {}, // root
    {
      prefix: this.prefix,
      backend: this.backend,
      routes: this.routes,
      db: this.db,
    }, // ctx
    variables,
    operationName
  );
}

module.exports = async (ctx) => {
  // Grab Authorization token & get user
  // TODO


  let {query, variables, operationName} = ctx.request.body;

  if (typeof variables === 'string') {
    variables = JSON.parse(variables);
  }

  ctx.type = 'application/json';
  ctx.body = await graphql(
    schema,
    query,
    {}, // root
    {
      db: ctx.db,
    }, // ctx
    variables,
    operationName
  );
}
