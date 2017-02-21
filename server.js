const Koa = require('koa');
const fs = require('fs');
const path = require('path');
const Router = require('koa-router');

const port = process.env.PORT || 8080;

const index = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const app = new Koa();
const router = new Router();

// SPA fallthrough
router.get('*', (ctx) => {
  ctx.body = index;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);
