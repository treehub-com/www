const db = require('../../lib/mysql.js');
const {expect} = require('chai');
const route = require('../route.js');

const ctx = {
  db,
  request: {
    get: () => '',
    body: {},
  }
};
const token = '1234';

describe('api/tokens', () => {
  before(async () => {
    await db.query('TRUNCATE users');
    await db.query('TRUNCATE tokens');
    // Create user1
    ctx.request.body = {
      query: `
        mutation x($input: UserCreateInput!) {
          createUser(input:$input) {
            user {id username email}
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          username: 'user1',
          email: 'user1@example.com',
        }
      }
    };
    await route(ctx);

    // Create tokens
    await db.query(`
      INSERT INTO
        tokens
      (token, user_id, expires, description)
      VALUES
      ('1234', 1, (NOW() + INTERVAL 1 DAY), ''),
      ('5678', 1, (NOW() + INTERVAL 1 DAY), '')
    `);
  });

  it('should error when unauthorized', async () => {
    ctx.request.get = () => '';
    ctx.request.body = {
      query: `
        query {
          tokens {
            id
            token
            redactedToken
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors.length).to.equal(1);
    expect(ctx.body.errors[0].message).to.contain('Unauthorized');
    expect(ctx.body.data).to.equal(null);
  });

  it('should return tokens', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        query {
          tokens {
            id
            token
            redactedToken
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const tokens = ctx.body.data.tokens;
    expect(tokens).to.not.equal(null);
    expect(tokens.length).to.equal(2);
    expect(tokens[0].token).to.equal(null);
    expect(tokens[0].redactedToken).to.not.equal(null);
    expect(tokens[1].token).to.equal(null);
    expect(tokens[1].redactedToken).to.not.equal(null);
  });
});
