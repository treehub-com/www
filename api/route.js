const gcs = require('../lib/gcs.js');
const {graphql} = require('graphql');
const mail = require('../lib/mail.js');
const {makeExecutableSchema} = require('graphql-tools');

const schema = makeExecutableSchema({
  typeDefs: require('./schema.js'),
  resolvers: require('./resolvers.js'),
});

module.exports = async (ctx) => {
  // userId is set ony if Authorization token is set and valid
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

  // Get graphql info
  let {query, variables, operationName} = ctx.request.body;

  // Parse variables if needed
  if (typeof variables === 'string') {
    variables = JSON.parse(variables);
  }

  // Perform request
  ctx.type = 'application/json';
  ctx.body = await graphql(
    schema,
    query,
    {}, // root
    {
      db: ctx.db,
      gcs,
      mail,
      userId,
    }, // ctx
    variables,
    operationName
  );
}
