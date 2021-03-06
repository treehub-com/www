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
    await db.query('TRUNCATE packages');
    await db.query('TRUNCATE package_owners');
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

    // Create package
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

    // Create package version
    await db.query(`
      INSERT INTO
        package_versions
      (package_id, version)
      VALUES
      ('pkg', 37)
    `);
  });

  it('should error when unauthorized', async () => {
    ctx.request.get = () => '';
    ctx.request.body = {
      query: `
        query {
          package(id: "pkg") {
            id
            description
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors.length).to.equal(1);
    expect(ctx.body.errors[0].message).to.contain('Unauthorized');
    expect(ctx.body.data.package).to.equal(null);
  });

  it('should return null on package not found', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        query {
          package(id: "missing") {
            id
            description
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    expect(ctx.body.data.package).to.equal(null);
  });

  it('should return the package', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        query {
          package(id: "pkg") {
            id
            description
            latest
          }
        }
      `,
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    expect(ctx.body.data.package).to.deep.equal({
      id: 'pkg',
      description: 'description',
      latest: 37,
    });
  });

});
