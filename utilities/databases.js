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

  // If the reset flag is set, reset the database
  if (reset) {
    let dropQuery = `DROP DATABASE IF EXISTS ${dbname};`;
    await connection
      .execute(dropQuery)
      .then(LOGGER.info(`Dropped database ${dbname}`))
      .catch((error) => {
        LOGGER.error(new ERRORS.DatabaseWriteError(error));
      });
    let createQuery = `CREATE DATABASE ${dbname};`;
    await connection
      .execute(createQuery)
      .then(LOGGER.info(`Created database ${dbname}`))
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

  // Create the activities table
  sqlQuery =
    "CREATE TABLE Activities(ActivityID INT, Name VARCHAR(50), Description VARCHAR(200), StartTime DATETIME, EndTime DATETIME, OwnerID INT, PRIMARY KEY (ActivityID), FOREIGN KEY (OwnerID) REFERENCES Users(UserID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table activities"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });

  // Create the UserActivity table
  sqlQuery =
    "CREATE TABLE UserActivity(UserID INT, ActivityID INT, PRIMARY KEY (UserID, ActivityID), FOREIGN KEY (UserID) REFERENCES Users (UserID), FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table UserActivity"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });

  // Create the Comments TABLE
  sqlQuery =
    "CREATE TABLE Comments(CommentID INT, UserID INT, ActivityID INT, Comment VARCHAR(200), Date DATETIME, PRIMARY KEY (CommentID), FOREIGN KEY (UserID) REFERENCES Users (UserID), FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID));";
  await connection
    .execute(sqlQuery)
    .then(LOGGER.info("Created table Comments"))
    .catch((error) => {
      LOGGER.error(new ERRORS.DatabaseWriteError(error));
    });
}

module.exports = {
  initialize,
  connection,
};