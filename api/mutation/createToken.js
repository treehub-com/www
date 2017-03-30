const moment = require('moment');
const uuidV4 = require('uuid/v4');

module.exports = async (_, {input}, {db}) => {
  const response = {
    token: null,
    errors: [],
  };

  const {
    code,
    description = '',
    expires,
  } = input;
  const expiration = expires ? moment.utc(expires) : moment.utc().add(1, 'y');

  // Ensure expires is valid and in the future
  if (!expiration.isAfter(moment.utc())) {
    response.errors.push({
      key: 'expires',
      message: 'Expiration must be in the future',
    });
    return response;
  }
  const query = await db.query(`
    SELECT
      user_id
    FROM
      codes
    WHERE
      code = ?
      AND expires > NOW()
  `, [code]);

  if (query.length !== 1) {
    response.errors.push({
      message: 'Unknown or expired code',
    });
    return response;
  }

  const userId = query[0]['user_id'];
  const token = uuidV4();

  const inserted = await db.query(`
    INSERT INTO
      tokens
    (token, user_id, expires, description)
    VALUES
    (?, ?, ?, ?)
  `, [token, userId, expiration.format('YYYY-MM-DD HH:mm:ss'), description]);
  const id = inserted.insertId;

  const deleted = await db.query(`
    DELETE FROM
      codes
    WHERE
      code = ?
  `, [code]);

  const results = await db.query(`
    SELECT
      id,
      user_id as userId,
      token,
      CONCAT('...', SUBSTRING(token, -7)) as redactedToken,
      description,
      created,
      expires
    FROM
      tokens
    WHERE
      token = ?
  `, [token]);

  response.token = results[0];

  return response;
};
