const LOGGER = require("../utilities/logger");
const MYSQL = require("mysql");
const ERRORS = require("../utilities/errors");

/**
 * Initialize the users database
 * @param {String} dbname the name of the database
 * @param {Boolean} reset if true, the database will be reset
 */
async function initialize(dbname, reset) {
  // Create a connection to the database
  connection = await MYSQL.createConnection({
    host: "localhost",
    user: "root",
    port: "10005",
    password: "pass",
    database: dbname,
  })
    .then(() => {
      LOGGER.info("Connection to the database created");
    })
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseConnectionError());
    });

  // If the reset flag is set, reset the database
  if (reset) {
    let dropQuery = "DROP TABLE IF EXISTS Users";
    await connection
      .execute(dropQuery)
      .then(LOGGER.info("Dropped table users"))
      .catch((error) => {
        LOGGER.error(new ERRORS.DatabaseWriteError(error));
      });
  }

  // Create the users table
  let sqlQuery =
    "CREATE TABLE Users( UserID INT, Username VARCHAR(30), Email VARCHAR(150), HashedPassword VARCHAR(150), PRIMARY KEY (UserID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table users"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });
}
