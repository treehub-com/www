const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const Router = require('koa-router');

const port = process.env.PORT || 8080;

const app = new Koa();
const router = new Router();

// Logo
router.get('/logo.png', async (ctx) => {
  ctx.set('Content-Type', 'image/png');
  ctx.body = await getFile('logo.png');
});

// SPA fallthrough
router.get('*', async (ctx) => {
  ctx.body = await getFile('index.html', 'utf8');
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);

function getFile(file, encoding=null) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, file), encoding, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
