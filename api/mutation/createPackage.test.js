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

describe('api/createPackage', () => {
  before(async () => {
    await db.query('TRUNCATE users');
    await db.query('TRUNCATE tokens');
    // Create user
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

    // Create token
    await db.query(`
      INSERT INTO
        tokens
      (token, user_id, expires, description)
      VALUES
      ('1234', 1, (NOW() + INTERVAL 1 DAY), '')
    `);
  });

  beforeEach(async () => {
    await db.query('TRUNCATE packages');
    await db.query('TRUNCATE package_owners');
  });

  it('should error when unauthorized', async () => {
    ctx.request.get = () => '';
    ctx.request.body = {
      query: `
        mutation x($input: PackageCreateInput!) {
          createPackage(input:$input) {
            package {id description}
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'pkg',
          description: 'description',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors.length).to.equal(1);
    expect(ctx.body.errors[0].message).to.contain('Unauthorized');
    expect(ctx.body.data).to.equal(null);
  });

  it('should error on invalid id', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackageCreateInput!) {
          createPackage(input:$input) {
            package {id description}
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'Invalid',
          description: 'description',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const response = ctx.body.data.createPackage;
    expect(response.package).to.equal(null);
    expect(response.errors.length).to.equal(1);
    let error = response.errors[0];
    expect(error.key).to.equal('id');
  });

  it('should create package', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackageCreateInput!) {
          createPackage(input:$input) {
            package {id description}
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'pkg',
          description: 'description',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const response = ctx.body.data.createPackage;
    expect(response.errors).to.deep.equal([]);
    expect(response.package).to.deep.equal({
      id: 'pkg',
      description: 'description',
    });
  });

  it('should error on existing package', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackageCreateInput!) {
          createPackage(input:$input) {
            package {id description}
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'pkg',
          description: 'description',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    let response = ctx.body.data.createPackage;
    expect(response.errors).to.deep.equal([]);
    expect(response.package).to.deep.equal({
      id: 'pkg',
      description: 'description',
    });

    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    response = ctx.body.data.createPackage;
    expect(response.package).to.equal(null);
    expect(response.errors.length).to.equal(1);
    let error = response.errors[0];
    expect(error.key).to.equal('id');
  });
});
