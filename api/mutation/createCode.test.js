const db = require('../../lib/mysql.js');
const {expect} = require('chai');
const proxyquire =  require('proxyquire');

let mailCalls = [];
const mailMock = {
  send: async (options) => {
    mailCalls.push(options);
  }
};

const route = proxyquire('../route.js', {'../lib/mail.js': mailMock});

const ctx = {
  db,
  request: {
    get: () => '',
    body: {},
  }
};

describe('api/createCode', () => {
  before(async () => {
    await db.query('TRUNCATE codes');
    await db.query('TRUNCATE tokens');
    await db.query('TRUNCATE users');
  });

  beforeEach(() => {
    mailCalls = [];
  });

  it('should error when user not found', async () => {
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
          login: 'bogus',
        }
      }
    }
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    let result = ctx.body.data.createCode;
    expect(result.errors.length).to.equal(1);
    expect(result.errors[0].key).to.equal(null);
    expect(result.errors[0].message).to.contain('not found');
    expect(result.message).to.equal(null);
  });

  it('should create and email the code', async () => {
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
    }
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    expect(ctx.body.data.createUser.errors.length).to.equal(0);

    // Create the code using username
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
    }
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    let result = ctx.body.data.createCode;
    expect(result.errors.length).to.equal(0);
    expect(result.message).to.contain('email');
    expect(mailCalls.length).to.equal(1);

    mailCalls = [];

    // Create the code using email
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
          login: 'a@b.c',
        }
      }
    }
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    result = ctx.body.data.createCode;
    expect(result.errors.length).to.equal(0);
    expect(result.message).to.contain('email');
    expect(mailCalls.length).to.equal(1);
  });
});
