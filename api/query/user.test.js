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

describe('api/user', () => {
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

    // Create user2
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
          username: 'user2',
          email: 'user2@example.com',
        }
      }
    };
    await route(ctx);

    // Create token
    await db.query(`
      INSERT INTO
        tokens
      (token, user_id, expires, description)
      VALUES
      ('1234', 1, (NOW() + INTERVAL 1 DAY), '')
    `);
  });

  it('should error when unauthorized', async () => {
    ctx.request.get = () => '';
    ctx.request.body = {
      query: `
        query {
          user(id: "1") {
            id
            username
            email
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors.length).to.equal(1);
    expect(ctx.body.errors[0].message).to.contain('Unauthorized');
    expect(ctx.body.data.user).to.equal(null);
  });

  it('should get user by id', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        query {
          user(id: "2") {
            id
            username
            email
          }
        }
      `,
    };
    await route(ctx);
    const user = ctx.body.data.user;
    expect(user).to.not.equal(null);
    expect(user.id).to.equal(2);
    expect(user.username).to.equal('user2');
    expect(user.email).to.equal(null);
  });

  it('should get user by email', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        query {
          user(login: "user1@example.com") {
            id
            username
            email
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const user = ctx.body.data.user;
    expect(user).to.not.equal(null);
    expect(user.id).to.equal(1);
    expect(user.username).to.equal('user1');
    expect(user.email).to.equal('user1@example.com');
  });

  it('should get user by username', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        query {
          user(login: "user1") {
            id
            username
            email
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const user = ctx.body.data.user;
    expect(user).to.not.equal(null);
    expect(user.id).to.equal(1);
    expect(user.username).to.equal('user1');
    expect(user.email).to.equal('user1@example.com');
  });

  it('should get authorized user', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        query {
          user {
            id
            username
            email
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const user = ctx.body.data.user;
    expect(user).to.not.equal(null);
    expect(user.id).to.equal(1);
    expect(user.username).to.equal('user1');
    expect(user.email).to.equal('user1@example.com');
  });
});
