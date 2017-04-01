const db = require('../../lib/mysql.js');
const {expect} = require('chai');
const proxyquire =  require('proxyquire');

const mailMock = {
  send: async () => {}
};

const route = proxyquire('../route.js', {'../lib/mail.js': mailMock});

const ctx = {
  db,
  request: {
    get: () => '',
    body: {},
  }
};

describe('api/createToken', () => {
  before(async () => {
    await db.query('TRUNCATE codes');
    await db.query('TRUNCATE tokens');
    await db.query('TRUNCATE users');
  });

  it('should error when code not found', async () => {
    ctx.request.body = {
      query: `
        mutation x($input: TokenCreateInput!) {
          createToken(input:$input) {
            token {
              token
            }
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          code: 'bogus',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    let result = ctx.body.data.createToken;
    expect(result.errors.length).to.equal(1);
    expect(result.errors[0].key).to.equal(null);
    expect(result.errors[0].message).to.contain('Unknown');
    expect(result.errors[0].message).to.contain('expired');
    expect(result.token).to.equal(null);
  });

  it('should error when code is expired');

  it('should create the token', async () => {
    // Create the user
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
          username: 'test',
          email: 'a@b.c',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    expect(ctx.body.data.createUser.errors.length).to.equal(0);

    // Create Code
    ctx.request.body = {
      query: `
        mutation x($input: CodeCreateInput!) {
          createCode(input:$input) {
            message
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          login: 'test',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    expect(ctx.body.data.createCode.errors.length).to.equal(0);

    const codeResult = await db.query('SELECT code FROM CODES LIMIT 1');
    const code = codeResult[0].code;

    ctx.request.body = {
      query: `
        mutation x($input: TokenCreateInput!) {
          createToken(input:$input) {
            token {
              id
              userId
              token
              redactedToken
              description
              created
              expires
            }
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          code,
          description: 'My Code',
          expires: '2100-01-01',
        }
      }
    };

    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const result = ctx.body.data.createToken;
    expect(result.errors.length).to.equal(0);
    expect(result.token).to.have.all.keys([
      'id', 'userId', 'token', 'redactedToken',
      'description', 'expires', 'created'
    ]);
    expect(result.token.userId).to.equal(1);
  });
});
