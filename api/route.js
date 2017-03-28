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
  let userId = null;

  // Grab Authorization token
  const authorization = ctx.request.get('authorization').split(/\s+/);

  // If token is set, check it's validity
  if (authorization.length === 2) {
    const token = authorization[1];
    const results = await ctx.db.query(`
      SELECT
        user_id
      FROM
        tokens
      WHERE
        token = ?
        AND expires > NOW()
    `, [token]);
    if (results.length === 1) {
      userId = results[0].user_id;
    }
  }

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
      userId,
    }, // ctx
    variables,
    operationName
  );
}
