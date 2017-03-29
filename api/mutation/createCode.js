const crypto = require('crypto');
const mail = require('../../lib/mail.js');
const query = `
  SELECT
    id,
    username,
    email
  FROM
    users
  WHERE
`;

const insert = `
  INSERT INTO
    codes
  (code, user_id, expires)
  VALUES
  (?, ?, (NOW() + INTERVAL 15 MINUTE))
`;

function generateCode() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(7, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        const hex = buffer.toString('hex').toUpperCase();
        resolve(`${hex.substr(0,3)}-${hex.substr(3,3)}-${hex.substr(6,3)}`);
      }
    });
  });
}

module.exports = async (_, {input}, {db}) => {
  const {login} = input;

  let results;

  // Retrieve the user
  if (/@/.test(login)) {
    results = await db.query(query + 'email = ?', [login]);
  } else {
    results = await db.query(query + 'username = ?', [login]);
  }

  if (results.length !== 1) {
    return 'User not found.';
  }

  const userId = results[0].id;
  const username = results[0].username;
  const email = results[0].email;

  // Generate a one time code
  let code = await generateCode();

  let inserted
  try {
    inserted = await db.query(insert, [code, userId]);
  } catch (error) {
    // Retry once on failure
    if (error.code === 'ER_DUP_ENTRY') {
      code = await generateCode();
      inserted = await db.query(insert, [code, userId]);
    } else {
      throw error;
    }
  }

  await mail.send({
    template: 'code',
    from: 'support@treehub.com',
    to: `${username} <${email}>`,
    variables: {
      code,
      email,
      username,
    }
  });

  return 'Code generated. Check your email.';
};
