module.exports = async (_, {id}, {db, userId}) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let pkg = null;

  const results = await db.query(`
    SELECT
      id,
      description
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
