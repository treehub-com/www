module.exports = async (_, {input}, {db, userId}) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const response = {
    package: null,
    errors: [],
  };

  const {id, description} = input;

  // Validate id
  if (!/^[a-z0-9][a-z0-9-]{0,126}[a-z0-9]$/.test(id)) {
    response.errors.push({
      key: 'id',
      message: 'id must match [a-z0-9][a-z0-9-]{0,126}[a-z0-9]',
    });
  }

  if (response.errors.length > 0) {
    return response;
  }

  try {
    await db.query(`
      INSERT INTO
        packages
      (id, description)
      VALUES
      (?, ?)
    `, [id, description]);
    await db.query(`
      INSERT INTO
        package_owners
      (package_id, user_id)
      VALUES
      (?, ?)
    `, [id, userId]);

    const results = await db.query(`
      SELECT
        id,
        description
      FROM
        packages
      WHERE
        id = ?
    `, [id]);
    response.package = results[0];
  } catch (error) {
    if (error.code == 'ER_DUP_ENTRY') {
      response.errors.push({
        key: 'id',
        message: 'package id is already taken',
      });
    } else {
      throw error;
    }
  }

  return response;
};
