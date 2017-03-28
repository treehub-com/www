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

module.exports = async (root, {id, login}, {db}) => {
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
    // TODO return authenticated user
  }
  return user;
};
