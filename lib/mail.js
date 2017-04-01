const fetch = require('node-fetch');
const FormData = require('form-data');
const url = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
const key = process.env.MAILGUN_API_KEY;
const auth = `Basic ${new Buffer(`api:${key}`).toString('base64')}`;

module.exports = {
  send: async ({template, from, to, variables}) => {
    const email = require(`../email/${template}.js`);
    const form = new FormData();
    form.append('from', from);
    form.append('to', to);
    form.append('subject', email.subject(variables));
    form.append('text', email.text(variables));
    form.append('html', email.html(variables));

    const res = await fetch(url, {
      method: 'POST',
      headers: Object.assign({
        'Authorization': auth,
      }, form.getHeaders()),
      body: form,
    });

    if (res.status !== 200) {
      throw new Error(`Could not send email (${res.status})`);
    }
  }
}
