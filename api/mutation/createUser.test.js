const db = require('../../lib/mysql.js');
const {expect} = require('chai');
const route = require('../route.js');

const ctx = {
  db,
  request: {
    get: () => '',
    body: {},
  }
}

describe('api/createUser', () => {
  before(async () => {
    await db.query('TRUNCATE users');
  });

  after(async () => {
  });

  it('should error on invalid username/email', async () => {
    ctx.request.body = {
      query: `
        mutation x($input: UserCreateInput!) {
          createUser(input:$input) {
            user {id username}
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          username: 'Invalid',
          email: 'ab.c',
        }
      }
    }
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const response = ctx.body.data.createUser;
    expect(response.user).to.equal(null);
    expect(response.errors.length).to.equal(2);
    let error = response.errors[0];
    expect(error.key).to.equal('username');
    error = response.errors[1];
    expect(error.key).to.equal('email');
  });

  it('should create user', async () => {
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
    const response = ctx.body.data.createUser;
    expect(response.errors).to.deep.equal([]);
    expect(response.user).to.deep.equal({
      id: 1,
      username: 'test',
      email: 'a@b.c'
    });
  });

  it('should error on duplicate username/email', async () => {
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
          username: 'duplicate',
          email: 'duplicate@example.com',
        }
      }
    }
    await route(ctx);
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
          username: 'duplicate',
          email: 'duplicate@example.com',
        }
      }
    }
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    let response = ctx.body.data.createUser;
    expect(response.user).to.equal(null);
    expect(response.errors.length).to.equal(1);
    let error = response.errors[0];
    expect(error.key).to.equal('username');
    expect(error.message).to.contain('taken');
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
          username: 'non-duplicate',
          email: 'duplicate@example.com',
        }
      }
    }
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    response = ctx.body.data.createUser;
    expect(response.user).to.equal(null);
    expect(response.errors.length).to.equal(1);
    error = response.errors[0];
    expect(error.key).to.equal('email');
    expect(error.message).to.contain('in use');
  });
});
