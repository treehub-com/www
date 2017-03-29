const fetch = require('node-fetch');
const key = process.env.MAILGUN_API_KEY;
const auth = `Basic ${new Buffer(`api:${key}`).toString('base64')}`;

module.exports = {
  send: async ({template, from, to, variables}) => {
    const email = require(`../email/${template}.js`);

    const res = fetch('/treehub.com/messages', {
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: email.subject(variables),
        text: email.text(variables),
        html: email.html(variables),
      }),
    });
console.log(res.status);
    if (res.status !== 200) {
      throw new Error('Could not send email');
    }
  }
}
