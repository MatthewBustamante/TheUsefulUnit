const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require("../logger");

/**
 * Creates a new coment and adds it to the database
 * @param {*} userID
 * @param {*} activityID
 * @param {*} comment
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
    .then(logger.info(`Successfully created comment \"${comment.value}\"`))
    .catch((error) => {
      logger.error(new ERRORS.DatabaseWriteError(error));
    });

  return comment;
}

/**
 * Delete a comment from the database
 * @param {*} userID the id of the user who wrote the comment
 * @param {*} activityID the id of the activity the comment is associated with
 * @returns true if successful, false otherwise
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
      return false;
    });

  return true;
}

module.exports = {
  createComment,
  deleteComment,
};
