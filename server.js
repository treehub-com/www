const bodyparser = require('koa-bodyparser');
const Koa = require('koa');
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const Router = require('koa-router');
const api = require('./api/route.js');

const port = process.env.PORT || 8080;

const app = new Koa();

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || '3306',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DATABASE,
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z'
});

app.context.db = {
  connection,
  query: (sql, values = []) => {
    return new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
}

const router = new Router();

// Logo
router.get('/logo.png', async (ctx) => {
  ctx.set('Content-Type', 'image/png');
  ctx.body = await getFile('img/logo.png');
});

// Treehub API
router.post('/', api);

// SPA fallthrough
router.get('*', async (ctx) => {
  ctx.body = await getFile('index.html', 'utf8');
});

app
  .use(bodyparser({detectJSON: (ctx) => true}))
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
