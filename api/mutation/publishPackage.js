const jszip = require('jszip');

module.exports = async (_, {input}, {db, gcs, userId}) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const response = {
    version: null,
    errors: [],
  };

  const {id, zip} = input;

  const permissions = await db.query(`
    SELECT
      package_id,
      (
        SELECT
          MAX(version)
        FROM
          package_versions
        WHERE
          package_id = package_owners.package_id
      ) as latest
    FROM
      package_owners
    WHERE
      package_id = ?
      AND user_id = ?
  `, [id, userId]);

  if (permissions.length !== 1) {
    response.errors.push({
      message: 'you do not have permission to publish or package does not exist',
    });
    return response;
  }

  // Latest will be an integer or NULL
  const currentVersion = permissions[0].latest || 0;
  const version = currentVersion + 1;

  const zPackage = await jszip.loadAsync(zip, {base64: true});

  // Ensure treehub.json exists and is valid
  const zTreehubJson = zPackage.file('treehub.json');
  if (zTreehubJson === null) {
    response.errors.push({
      key: 'zip',
      message: 'missing treehub.json',
    });
    return response;
  }

  const treehubJson = await zTreehubJson.async('string');
  let json;
  try {
    json = JSON.parse(treehubJson);
  } catch (error) {
    response.errors.push({
      key: 'zip',
      message: 'treehub.json must be a json file',
    });
    return response;
  }

  // Check name
  if (json.name !== id) {
    response.errors.push({
      key: 'zip',
      message: 'treehub.json name must match id',
    });
    return response;
  }

  // Set version
  json.version = version;

  // Put json back into zip
  zPackage.file('treehub.json', JSON.stringify(json));

  // Upload Zip to packages.treehub.com as version
  await gcs.uploadPackage({
    name: id,
    version: version,
    zip: zPackage,
  });

  // Save version to the database
  await db.query(`
    INSERT INTO
      package_versions
    (package_id, version)
    VALUES
    (?, ?)
  `,[id, version]);

  // Update package description
  await db.query(`
    UPDATE
      packages
    SET
      description = ?
    WHERE
      id = ?
  `,[json.description, id]);

  // Upload Zip to packages.treehub.com as latest
  await gcs.uploadPackage({
    name: id,
    version: 'latest',
    zip: zPackage,
    cacheControl: 'no-cache'
  });

  // Rebuild packages.json
  // TODO Move this functionality to a cron job
  const packages = await db.query(`
    SELECT
      packages.id,
      packages.description,
      MAX(package_versions.version) as latest
    FROM
      packages
    LEFT JOIN
      package_versions on (packages.id = package_versions.package_id)
    GROUP BY
      packages.id
  `);
  const packagesJSON = {};
  for (const pkg of packages) {
    packagesJSON[pkg.id] = {
      description: pkg.description,
      latest: pkg.latest,
    };
  }
  await gcs.uploadPackagesJSON({json: packagesJSON});

  // Set version and return response
  response.version = version;
  return response;
};
