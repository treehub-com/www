const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: process.env.MYSQL_CONNECTION_LIMIT || 100,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || '3306',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DATABASE,
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z'
});

module.exports = {
  // If you use this, make sure to call connection.release()!
  connection: () => {
    return new Promise((resolve, reject) => {
      pool.getConnection(function(error, connection) {
        if (error) {
          reject(error);
        } else {
          resolve(connection);
        }
      });
    });
  },
  query: (sql, values = []) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  },
  close: () => {
    return new Promise((resolve, reject) => {
      pool.end(function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    })
  }
}
