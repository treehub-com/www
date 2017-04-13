const bodyparser = require('koa-bodyparser');
const Koa = require('koa');
const fs = require('fs');
const db = require('./lib/mysql.js');
const path = require('path');
const Router = require('koa-router');
const send = require('koa-send');
const api = require('./api/route.js');

const port = process.env.PORT || 8080;

const app = new Koa();

app.context.db = db;

const router = new Router();

// Static assets
router.get('/s/(.*)+', async (ctx) => {
  await send(ctx, ctx.path.substr(2), {root: __dirname + '/assets'});
});

// Treehub API
router.post('/', api);

// SPA fallthrough
router.get('*', async (ctx) => {
  await send(ctx, '/index.html', {root: __dirname + '/assets'});
});

app
  .use(bodyparser({detectJSON: (ctx) => true, jsonLimit: '5mb'}))
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);

function getFile(file, encoding=null) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'assets', file), encoding, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
