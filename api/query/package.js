module.exports = async (_, {id}, {db, userId}) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let pkg = null;

  const results = await db.query(`
    SELECT
      id,
      description,
      (
        SELECT
          MAX(version)
        FROM
          package_versions
        WHERE
          package_id = packages.id
      ) as latest
    FROM
      packages
    WHERE
      id = ?
  `, [id]);

  if (results.length == 1) {
    pkg = results[0];
  }

  return pkg;
};
