module.exports = {
  key: (error) => error.key || null,
  message: (error) => error.message,
};
