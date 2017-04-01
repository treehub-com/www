module.exports = {
  subject: () => `Your Treehub login code`,
  text: ({username, code}) => `
${username}

Here is your login code: ${code}

Cheers,

Treehub
  `,
  html: ({username, code}) => `
${username}
<br /><br />
Here is your login code: <b>${code}</b>
<br /><br />
Cheers,
<br />
Treehub
  `,
}
