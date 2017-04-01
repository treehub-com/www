module.exports = async (_, {}, {db, userId}) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const results = await db.query(`
    SELECT
      id,
      user_id as userId,
      CONCAT('...', SUBSTRING(token, -7)) as redactedToken,
      description,
      created,
      expires
    FROM
      tokens
    WHERE
      user_id = ?
  `, [userId]);

  return results;
};
