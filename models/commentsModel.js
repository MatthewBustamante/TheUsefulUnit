const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require('../logger');

let connection = DATABASES.getConnection();

/**
 * Creates a new coment and adds it to the database
 * @param {*} userID
 * @param {*} activityID
 * @param {*} comment
 * @returns the comment object
 */
async function createComment(userID, activityID, comment) {
    logger.info("Comment model called (Create)");

    if (comment == undefined || !validator.isValidComment(comment)) {
        logger.error("Invalid comment");

        throw new ERRORS.ValidationError("Invalid comment: '" + comment + "'");
    }

    //Get the date of the comment (today)
    var today = new Date();
    today = today.toISOString().slice(0,10);

    var comment = {
        userID: userID,
        activityID: activityID,
        value: comment,
        date: today
    }

    await connection.execute(`INSERT INTO Comments (UserID, ActivityID, Comment, Date) VALUES (?, ?, ?, ?);`, [comment.userID, comment.activityID, comment.value, comment.date])
    .then
    (logger.info("Successfully created comnment [model]"))
    .catch
    ((error) => {
    logger.error(new ERRORS.DatabaseWriteError(error));
    });
    
    return comment;
}

module.exports = {
    connection,
    createComment
};