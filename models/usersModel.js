const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require('../logger');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let connection = DATABASES.getConnection();

/**
 * Creates a new user and adds it to the database
 * @param {*} username
 * @param {*} email
 * @param {*} password
 * @returns the user's id, username and email that was created
 */
async function createUser(username, email, unhashedpassword, passwordrepeat) {
  //check if both passwords are the same
  if (unhashedpassword !== passwordrepeat) {
    let error = new ERRORS.ValidationError();
    error.message = "Passwords do not match";
    throw error;
  }
  //validate the inputed values
  try {
    validator.isValidNewUsername(username, connection);
    validator.isValidNewEmail(email, connection);
    validator.isValidPassword(unhashedpassword);
  } catch (error) {
    throw error;
  }

  //hash the password
  const hashedPassword = bcrypt.hashSync(unhashedpassword, saltRounds);

  //insert the user into the database
  const sqlQuery = `INSERT INTO Users (Username, Email, HashedPassword) VALUES ('${username}', '${email}', '${hashedPassword}')`;
  try {
    await connection.execute(sqlQuery);
    logger.info("User created");
  } catch (error) {
    logger.error(error);
    throw error;
  }
  //get the id of the new user
  const sqlQuery2 = `SELECT UserID FROM Users WHERE Username = '${username}' AND Email = '${email}'`;
  try {
    const userId = await connection.execute(sqlQuery2);
    logger.info("User id retrieved");
    return { id: userId, username: username, email: email };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Gets the user with the given username and/or email
 * @param {*} username username of the user to look for
 * @param {*} email email of the user to look for
 * @returns the user that was found
 */
async function getUser(username, email) {
  const sqlQuery = `SELECT * FROM Users WHERE Username = '${username}' OR Email = '${email}'`;
  try {
    const result = await connection.execute(sqlQuery);
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
 * @param {*} firstNewPassword new password of the user to enter for the first time
 * @param {*} secondNewPassword new password of the user to enter for the second time
 * @param {*} oldPassword old password of the user to be entered
 */
async function UpdateUserInformations(
  id,
  username,
  email,
  firstNewPassword,
  secondNewPassword,
  oldPassword
) {
  //updates the info for the username and email only
  if (
    firstNewPassword === "" &&
    secondNewPassword === "" &&
    oldPassword === ""
  ) {
    ValidateUserInputedWithoutPassword(username, email);
    //update the user's username and email
    const sqlQuery = `UPDATE Users SET Username = '${username}', Email = '${email}' WHERE UserID = ${id}`;
    try {
      await connection.execute(sqlQuery);
      logger.info("User username and email updated");

      return { username: username, email: email };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
  //updates all properties
  //get the current password from the database and store it in a variable
  const sqlQuery = `SELECT HashedPassword FROM Users WHERE UserID = ${id}`;
  try {
    const result = await connection.execute(sqlQuery);
    const currentPassword = result[0][0];
  } catch (error) {
    logger.error(error);
    throw error;
  }
  //check if the old password is correct
  if (!bcrypt.compareSync(oldPassword, currentPassword.HashedPassword)) {
    const error = new ERRORS.ValidationError();
    error.message = "Old password is incorrect";
    throw error;
  }
  //check if both new passwords are the same
  if (firstNewPassword === secondNewPassword) {
    //call validate functions for the parameters
    ValidateUserInputedWithoutPassword(username, email);
    ValidatePasswordInputed(firstNewPassword);

    //hash the new password
    const hashedPassword = bcrypt.hashSync(firstNewPassword, saltRounds);

    //update the user's username, email, and password
    const sqlQuery = `UPDATE Users SET Username = '${username}', Email = '${email}', HashedPassword = '${hashedPassword}' WHERE UserID = ${id}`;
    try {
      await connection.execute(sqlQuery);
      logger.info("User username, email, and password updated");

      return { username: username, email: email };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}

/**
 * Deletes a user from the database
 * @param {*} id id of the user to delete
 */
async function DeleteUser(id) {
  const sqlQuery = `DELETE FROM Users WHERE UserID = ${id}`;
  try {
    await connection.execute(sqlQuery);
    logger.info("User deleted");
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Validates the username and email of the inputed values
 * @param {*} username username to be validated
 * @param {*} email email to be validated
 */
async function ValidateUserInputedWithoutPassword(username, email) {
  try {
    validator.isValidNewUsername(username, connection);
    validator.isValidNewEmail(email, connection);
  } catch (error) {
    throw error;
  }
}

/**
 * Validates the new password
 * @param {*} firstNewPassword
 */
async function ValidatePasswordInputed(firstNewPassword) {
  try {
    validator.isValidPassword(firstNewPassword);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  UpdateUserInformations,
  DeleteUser,
};
