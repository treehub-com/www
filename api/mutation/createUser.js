module.exports = async (_, {input}, {db}) => {
  const {username, email} = input;

  if (!/^[0-9a-z][0-9a-z-]{0,62}[0-9a-z]$/.test(username)) {
    throw new Error('username must match [0-9a-z][0-9a-z-]{0,62}[0-9a-z]');
  }

  if (!/^.+@.+\..+$/.test(email)) {
    throw new Error('email must match .+@.+\..+');
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
    return results[0];
  } catch (error) {
    if (error.code == 'ER_DUP_ENTRY') {
      if (/for key 'username'/.test(error.message)) {
        throw new Error('username is already taken');
      } else {
        throw new Error('email is already in use');
      }
    } else {
      throw error;
    }
  }
};
