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

Here is your login code: <b>${code}</b>

Cheers,

Treehub
  `,
}
