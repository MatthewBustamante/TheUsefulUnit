const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require("../utilities/logger");

async function getAllComments(activityID) {
  const connection = DATABASES.connection;
  const sqlQuery = `SELECT * FROM Comments WHERE ActivityID = ${activityID}`;
  try {
    const result = await connection.execute(sqlQuery);
    return result[0];
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Delete a comment from the database
 * @param {*} userID the id of the user who wrote the comment
 * @param {*} activityID the id of the activity the comment is associated with
 * @throws {DatabaseWriteError} if the comment does not exist
 */
async function deleteComment(userID, activityID) {
  // Get the connection to the database
  let connection = DATABASES.getConnection();
  // Remove the comment from the database
  await connection
    .execute(`DELETE FROM Comments WHERE UserID = ? AND ActivityID = ?;`, [
      userID,
      activityID,
    ])
    .then(logger.info("Successfully deleted comment"))
    .catch((error) => {
      logger.error(new ERRORS.DatabaseWriteError(error));
      throw error;
    });
}

module.exports = {
  getAllComments,
  deleteComment,
};
