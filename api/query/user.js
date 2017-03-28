const query = `
  SELECT
    id,
    username,
    email,
    created
  FROM
    users
  WHERE
`;

module.exports = async (_, {id, login}, {db, userId}) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let user = null;
  if (id) {
    const results = await db.query(query + 'id = ?', [id]);
    if (results.length == 1) {
      user = results[0];
    }
  } else if (login && /@/.test(login)) {
    const results = await db.query(query + 'email = ?', [login]);
    if (results.length == 1) {
      user = results[0];
    }
  } else if (login) {
    const results = await db.query(query + 'username = ?', [login]);
    if (results.length == 1) {
      user = results[0];
    }
  } else {
    const results = await db.query(query + 'id = ?', [userId]);
    if (results.length == 1) {
      user = results[0];
    }
  }
  return user;
};
