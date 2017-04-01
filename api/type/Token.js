module.exports = {
  id: (token) => token.id,
  userId: (token) => token.userId,
  token: (token) => token.token || null,
  redactedToken: (token) => token.redactedToken,
  description: (token) => token.description || '',
  created: (token) => token.created,
  expires: (token) => token.expires,
};
