const db = require('../../lib/mysql.js');
const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const proxyquire =  require('proxyquire');

let gcsCalls = [];
const gcsMock = {
  uploadPackage: async ({name, version, cacheControl}) => {
    gcsCalls.push({name, version, cacheControl});
  }
};

const route = proxyquire('../route.js', {'../lib/gcs.js': gcsMock});

const ctx = {
  db,
  request: {
    get: () => '',
    body: {},
  }
};
const token = '1234';
let zip;

describe('api/publishPackage', () => {
  before(async () => {
    await db.query('TRUNCATE users');
    await db.query('TRUNCATE tokens');
    await db.query('TRUNCATE packages');
    await db.query('TRUNCATE package_owners');
    await db.query('TRUNCATE package_versions');
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

    // Create packages
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
          id: 'test',
          description: 'description',
        }
      }
    };
    await route(ctx);
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
          id: 'no-perm',
          description: 'description',
        }
      }
    };
    await route(ctx);

    // Remove permissions for no-perm package
    await db.query(`DELETE FROM package_owners WHERE package_id = 'no-perm'`);

    // Get the base64 encoded zip file
    zip = fs.readFileSync(path.join(__dirname, '../../test/test.zip'))
            .toString('base64');
  });

  beforeEach(() => {
    gcsCalls = [];
  });

  after(() => {
    zip = null;
  })

  it('should error when when unauthorized', async () => {
    ctx.request.get = () => '';
    ctx.request.body = {
      query: `
        mutation x($input: PackagePublishInput!) {
          publishPackage(input:$input) {
            version
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'test',
          zip,
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors.length).to.equal(1);
    expect(ctx.body.errors[0].message).to.contain('Unauthorized');
    expect(ctx.body.data).to.equal(null);
  });

  it('should error when package not found', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackagePublishInput!) {
          publishPackage(input:$input) {
            version
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'bogus',
          zip,
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const response = ctx.body.data.publishPackage;
    expect(response.version).to.equal(null);
    expect(response.errors.length).to.equal(1);
    let error = response.errors[0];
    expect(error.key).to.equal(null);
  });

  it('should error when user does not have permission', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackagePublishInput!) {
          publishPackage(input:$input) {
            version
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'no-perm',
          zip,
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const response = ctx.body.data.publishPackage;
    expect(response.version).to.equal(null);
    expect(response.errors.length).to.equal(1);
    let error = response.errors[0];
    expect(error.key).to.equal(null);
  });

  it('should error when zip is invalid', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackagePublishInput!) {
          publishPackage(input:$input) {
            version
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'test',
          zip: '1234',
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors.length).to.equal(1);
    expect(ctx.body.errors[0].message).to.contain('Corrupted');
    expect(ctx.body.data).to.equal(null);
  });

  it('should error when treehub.json is missing');

  it('should error when treehub.json is not valid json');

  it('should error when id and zip name do not match', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackagePublishInput!) {
          publishPackage(input:$input) {
            version
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'pkg',
          zip,
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const response = ctx.body.data.publishPackage;
    expect(response.version).to.equal(null);
    expect(response.errors.length).to.equal(1);
    let error = response.errors[0];
    expect(error.key).to.equal('zip');
    expect(error.message).to.contain('name must match id');
  });

  it('should error when treehub.json is invalid');

  it('should publish package', async () => {
    ctx.request.get = () => `Token ${token}`;
    ctx.request.body = {
      query: `
        mutation x($input: PackagePublishInput!) {
          publishPackage(input:$input) {
            version
            errors {key message}
          }
        }
      `,
      variables: {
        input: {
          id: 'test',
          zip,
        }
      }
    };
    await route(ctx);
    expect(ctx.body.errors).to.equal(undefined);
    const response = ctx.body.data.publishPackage;
    expect(response.errors).to.deep.equal([]);
    expect(response.version).to.equal(1);
    expect(gcsCalls.length).to.equal(2);
    expect(gcsCalls[0]).to.deep.equal({
      name: 'test',
      version: 1,
      cacheControl: undefined,
    });
    expect(gcsCalls[1]).to.deep.equal({
      name: 'test',
      version: 'latest',
      cacheControl: 'no-cache',
    });
  });

});
