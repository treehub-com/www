module.exports = async (_, {input}, {db}) => {
  const response = {
    user: null,
    errors: [],
  };

  const {username, email} = input;

  if (!/^[0-9a-z][0-9a-z-]{0,62}[0-9a-z]$/.test(username)) {
    response.errors.push({
      key: 'username',
      message: 'username must match [0-9a-z][0-9a-z-]{0,62}[0-9a-z]',
    });
  }

  if (!/^.+@.+\..+$/.test(email)) {
    response.errors.push({
      key: 'email',
      message: 'email must match .+@.+\..+',
    });
  }

  if (response.errors.length > 0) {
    return response;
  }

  try {
    const inserted = await db.query(`
      INSERT INTO
        users
      (username, email)
      VALUES
      (?, ?)
    `, [username, email]);
    const id = inserted.insertId;

    const results = await db.query(`
      SELECT
        id,
        username,
        email,
        created
      FROM
        users
      WHERE
        id = ?
    `, [id]);
    response.user = results[0];
  } catch (error) {
    if (error.code == 'ER_DUP_ENTRY') {
      if (/for key 'username'/.test(error.message)) {
        response.errors.push({
          key: 'username',
          message: 'username is already taken',
        });
      } else {
        response.errors.push({
          key: 'email',
          message: 'email is already in use',
        });
      }
    } else {
      throw error;
    }
  }

  return response;
};
