const fs = require('fs');
const path = require('path');
const schemaDirectory = path.join(__dirname, '../schema');

const metaTable = `
CREATE TABLE _meta (
  _key VARCHAR(64) NOT NULL,
  _value TEXT NOT NULL,
  PRIMARY KEY (_key)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`;


module.exports = async({connection, createMetaTable = false}) => {
  // Get migrations
  const migrations = fs.readdirSync(schemaDirectory);
  migrations.sort((a, b) => {
    if (parseVersion(a) < parseVersion(b)) {
      return -1;
    } else {
      return 1;
    }
  });
  const latestVersion = parseVersion(migrations[migrations.length-1]);
  console.log(`The latest version is ${latestVersion}`);

  // Get current version
  const currentVersion = await getVersion({connection, createMetaTable});
  console.log(`Database is currently at ${currentVersion}`);

  // If we are at the current version, short circuit
  if (currentVersion === latestVersion) {
    console.log('Database is at the latest version');
    return;
  }

  // Loop through and perform migrations
  for (const file of migrations) {
    const version = parseVersion(file);
    if (version > currentVersion) {
      await performMigration({
        version,
        file: path.join(schemaDirectory, file),
        connection,
      });
    }
  }

  const newVersion = await getVersion({connection});
  console.log(`Database is now at ${newVersion}`);
}

function parseVersion(file) {
  return parseInt(file.split('.')[0]);
}

async function getVersion({connection, createMetaTable = false}) {
  try {
    const results = await query(connection, `
      SELECT
        _value
      FROM
        _meta
      WHERE
        _key = 'version'
    `);
    if (results.length !== 1) {
      throw new Error('Cannot get database version');
    }
    return parseInt(results[0]._value);
  } catch (error) {
    if (error.code == 'ER_NO_SUCH_TABLE' && createMetaTable === true) {
      await initializeMetaTable({connection});
      return getVersion({connection});
    } else {
      throw error;
    }
  }
}

async function initializeMetaTable({connection}) {
  await query(connection, metaTable + `
    INSERT INTO
      _meta
    (_key, _value)
    VALUES
    ('version','0')
  `);
}

async function performMigration({version, file, connection}) {
  const migration = fs.readFileSync(file, 'utf8');
  console.log('migrating', version, file);
  await query(connection, migration);
  await setVersion({version, connection});
}

async function setVersion({version, connection}) {
  const results = await query(connection, `
    UPDATE
      _meta
    SET
      _value = ?
    WHERE
      _key = 'version'
  `, [
    version
  ]);

  if (results.changedRows !== 1) {
    throw new Error('Could not update version');
  }
}

function query(connection, sql, values = []) {
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
