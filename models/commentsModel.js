const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require("../utilities/logger");

/**
 * Creates a new comment and adds it to the database
 * @param {int} userID the id of the user who made the comment
 * @param {int} activityID the id of the activity the comment is for
 * @param {string} comment is the comment to add
 * @returns the comment object
 */
async function createComment(userID, activityID, comment) {
  let connection = DATABASES.getConnection();

  logger.info("Comment model called (Create)");

  if (comment == undefined || !validator.isValidComment(comment)) {
    logger.error("Invalid comment");

    throw new ERRORS.ValidationError("Invalid comment: '" + comment + "'");
  }

  //Get today's date
  var today = new Date().toISOString().slice(0, 19).replace("T", " ");

  var comment = {
    userID: userID,
    activityID: activityID,
    value: comment,
    date: today,
  };

  await connection
    .execute(
      `INSERT INTO Comments (UserID, ActivityID, Comment, Date) VALUES (?, ?, ?, ?);`,
      [comment.userID, comment.activityID, comment.value, comment.date]
    )
    .then(logger.info("Successfully created comment [model]"))
    .catch((error) => {
      logger.error(new ERRORS.DatabaseWriteError(error));
    });

  return comment;
}

/**
 * Gets all the comments associated with a given activity
 * @param {int} activityID the id of the activity to get comments for
 * @throws {databaseReadError} if the comment could not be read
 */
async function getAllComments(activityID) {
  const connection = DATABASES.connection;
  const sqlQuery = `SELECT * FROM Comments WHERE ActivityID = ${activityID}`;
  try {
    const result = await connection.execute(sqlQuery);
    return result[0];
  } catch (error) {
    let customError = new ERRORS.DatabaseReadError(error.message);
    logger.error(customError);
    throw customError;
  }
}

/**
 * Delete a comment from the database
 * @param {int} commentID the id of the comment to delete
 * @throws {DatabaseWriteError} if the comment does not exist
 */
async function deleteComment(commentID) {
  // Get the connection to the database
  let connection = DATABASES.getConnection();
  // Remove the comment from the database
  await connection
    .execute(`DELETE FROM Comments WHERE CommentID = ?;`, [commentID])
    .then(logger.info("Successfully deleted comment"))
    .catch((error) => {
      let customError = new ERRORS.DatabaseWriteError(error.message);
      logger.error(customError);
      throw customError;
    });
}

module.exports = {
  createComment,
  getAllComments,
  deleteComment,
};

