const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require("../logger");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/**
 * Creates a new user and adds it to the database
 * @param {String} username the username of the new user
 * @param {String} email the email of the new user
 * @param {String} password the password of the new user
 * @returns the user's id, username and email that was created
 */
async function createUser(username, email, unhashedpassword, passwordrepeat) {                                 //Finished test
  try {
    const connection = DATABASES.getConnection();

    //validate the inputed values
    await validator.isValidNewUsername(username, connection);
    await validator.isValidNewEmail(email, connection);
    validator.isValidPassword(unhashedpassword);
    validator.isValidPasswordRepeat(unhashedpassword, passwordrepeat);

    //hash the password
    const hashedPassword = bcrypt.hashSync(unhashedpassword, saltRounds);

    //insert the user into the database
    const sqlQuery = `INSERT INTO Users (Username, Email, HashedPassword) VALUES ('${username}', '${email}', '${hashedPassword}')`;
    await connection.execute(sqlQuery);
    logger.info("User created");

    //get the id of the new user
    const sqlQuery2 = `SELECT UserID FROM Users WHERE Username = '${username}' AND Email = '${email}'`;
    const userId = await connection.execute(sqlQuery2);
    logger.info("User id retrieved");
    return { id: userId[0][0].UserID, username: username, email: email };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Gets the user with the given username and/or email
 * @param {*} username username of the user to look for
 * @param {*} email email of the user to look for
 * @returns the user that was found null if no user was found
 */
async function getUser(identifier) {                                 //Finished test
  try {
    // Connect to the database
    const connection = DATABASES.getConnection();
    var sqlQuery;

    // Check if the identifier is an email or a username and adapt the query accordingly
    if (identifier.includes("@")) {
      sqlQuery = `SELECT * FROM Users WHERE Email = '${identifier}'`;
    } else {
      sqlQuery = `SELECT * FROM Users WHERE Username = '${identifier}'`;
    }

    // Execute the query
    const result = await connection.execute(sqlQuery);

    // return the user
    return result[0][0];
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Updates the user's information
 * @param {*} id id of the user to update
 * @param {*} username username of the user to update
 * @param {*} email email of the user to update
 * @param {*} newPassword new password of the user to enter for the first time
 * @param {*} newPasswordRepeat new password of the user to enter for the second time
 * @param {*} oldPassword old password of the user to be entered
 */
async function UpdateUserInformations(id, username, email, newPassword, newPasswordRepeat, oldPassword) {
  // Connect to the database
  const connection = DATABASES.getConnection();
  try {
    // If no information was put in to the password fields, don't update the password
    if (newPassword === "" && newPasswordRepeat === "" && oldPassword === "") {
      // Validate the new username and email
      await validator.isValidNewUsername(username, connection);
      await validator.isValidNewEmail(email, connection);

      // Update the user's username and email
      const sqlQuery = `UPDATE Users SET Username = '${username}', Email = '${email}' WHERE UserID = ${id}`;
      await connection.execute(sqlQuery);
      logger.info("User username and email updated");

      return { username: username, email: email };
    }

    // Updates all properties
    // Get the current password from the database and store it in a variable
    const sqlQuery = `SELECT HashedPassword FROM Users WHERE UserID = ${id}`;
    const result = await connection.execute(sqlQuery);
    const currentPassword = result[0][0];

    //check if the old password is correct
    if (!bcrypt.compareSync(oldPassword, currentPassword.HashedPassword)) {
      const error = new ERRORS.ValidationError();
      error.message = "Old password is incorrect";
      return null;
    }

    // Validate the new user information
    await validator.isValidNewUsername(username, connection);
    await validator.isValidNewEmail(email, connection);
    validator.isValidPassword(newPassword);
    validator.isValidPasswordRepeat(newPassword, newPasswordRepeat);

    //hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    //update the user's username, email, and password
    const sqlQuery2 = `UPDATE Users SET Username = '${username}', Email = '${email}', HashedPassword = '${hashedPassword}' WHERE UserID = ${id}`;
    await connection.execute(sqlQuery2);
    logger.info("User username, email, and password updated");

    return { username: username, email: email };
  } catch (error) {
    logger.error(error);
    return null;
  }
}

/**
 * Deletes the user with the given id by verifying the given password
 * @param {*} userID id of the user to delete
 * @param {*} password password of the user to delete
 */
async function DeleteUser(id) {                                 //Finished test
  const connection = DATABASES.getConnection();
  //delete the user's comments
  const sqlQuery1 = `DELETE FROM Comments WHERE UserID = ${id}`;
  try {
    await connection.execute(sqlQuery1);
    logger.info("User comments deleted");

  } catch (error) {
    logger.error(error);
    throw error;
  }
  //delete the from the UserActivity table
  const sqlQuery2 = `DELETE FROM UserActivity WHERE UserID = ${id}`;
  try {
    await connection.execute(sqlQuery2);
    logger.info("User activity deleted");
  } catch (error) {
    logger.error(error);
    throw error;
  }

  //delete all the user's activities
  const sqlQuery3 = `DELETE FROM Activities WHERE OwnerID = ${id}`;

  try {
    await connection.execute(sqlQuery3);
    logger.info("Deleted user activities deleted");
  } catch (error) {
    logger.error(error);
    throw error;
  }

  try {
    const sqlQuery4 = `DELETE FROM Users WHERE UserID = ${id}`;
    await connection.execute(sqlQuery4);
    logger.info("User deleted");
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Gets the user by their ID.
 * @param {*} ID The ID of the user
 */
 async function getUsernameByID(ID) {                                 //Finished test
  try {
    const connection = DATABASES.getConnection();
    var sqlQuery = `SELECT Username FROM Users WHERE UserID = ?`;
    let result = await connection.execute(sqlQuery, [ID]);

    return result[0][0];
  }
  catch (error) {
    logger.error(error);
    console.log(error);
  }
}

module.exports = {
  createUser,
  UpdateUserInformations,
  DeleteUser,
  getUser,
  getUsernameByID
};
