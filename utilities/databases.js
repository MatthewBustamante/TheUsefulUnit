const LOGGER = require("./logger");
const MYSQL = require("mysql2/promise");
const ERRORS = require("./errors");

let connection;

/**
 * Initialize the FriendFinder database
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
    .then(LOGGER.info("Connected to database"))
    .catch((error) => {
      LOGGER.error(error);
    });

  // If the reset flag is set, reset the database
  if (reset) {
    // Drop table in order of dependency
    let dropQuery = `DROP TABLE IF EXISTS Comments`;
    await connection
      .execute(dropQuery)
      .then(LOGGER.info("Dropped Comments"))
      .catch((error) => {
        LOGGER.error(error);
      });

    dropQuery = `DROP TABLE IF EXISTS UserActivity`;
    await connection
      .execute(dropQuery)
      .then(LOGGER.info("Dropped UserActivity"))
      .catch((error) => {
        LOGGER.error(error);
      });

    dropQuery = `DROP TABLE IF EXISTS Activities`;
    await connection
      .execute(dropQuery)
      .then(LOGGER.info("Dropped Activities"))
      .catch((error) => {
        LOGGER.error(error);
      });

    // Drop all the tables in the database
    dropQuery = "DROP TABLE IF EXISTS Users";
    await connection
      .execute(dropQuery)
      .then(LOGGER.info("Dropped Users"))
      .catch((error) => {
        LOGGER.error(error);
      });
  }

  // Create the users table
  let sqlQuery =
    "CREATE TABLE IF NOT EXISTS Users( UserID INT AUTO_INCREMENT, Username VARCHAR(30), Email VARCHAR(150), HashedPassword VARCHAR(150), PRIMARY KEY (UserID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table users"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });

  // Create the activities table
  sqlQuery =
    "CREATE TABLE IF NOT EXISTS Activities(ActivityID INT AUTO_INCREMENT, Name VARCHAR(50), Description VARCHAR(200), StartTime DATETIME, EndTime DATETIME, OwnerID INT, PRIMARY KEY (ActivityID), FOREIGN KEY (OwnerID) REFERENCES Users(UserID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table activities"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });

  // Create the UserActivity table
  sqlQuery =
    "CREATE TABLE IF NOT EXISTS UserActivity(UserID INT, ActivityID INT, PRIMARY KEY (UserID, ActivityID), FOREIGN KEY (UserID) REFERENCES Users (UserID), FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table UserActivity"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });

  // Create the Comments TABLE
  sqlQuery =
    "CREATE TABLE IF NOT EXISTS Comments(CommentID INT AUTO_INCREMENT, UserID INT, ActivityID INT, Comment VARCHAR(200), Date DATETIME, PRIMARY KEY (CommentID), FOREIGN KEY (UserID) REFERENCES Users (UserID), FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table Comments"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });
}

function getConnection() {
  return connection;
}

module.exports = {
  initialize,
  getConnection,
};
