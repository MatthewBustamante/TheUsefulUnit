const VALIDATOR = require("validator");
const ERRORS = require("./errors");
const MIN_USERNAME_LENGTH = 6; // Minimum username length for security purposes. See https://security.stackexchange.com/questions/46875/why-is-there-a-minimum-username-length
const MAX_USERNAME_LENGTH = 30; // Maximum username length for security purposes. See https://stackoverflow.com/questions/3797098/what-are-the-standard-minimum-and-maximum-lengths-of-username-password-and-email
const INAPPROPRIATE_WORDS = [
  "fuck",
  "acrotomophilia",
  "shit",
  "bitch",
  "dick",
  "ass",
  "pussy",
  "cunt",
  "bollocks",
  "bugger",
  "choad",
  "wanker",
  "twat",
  "penis",
  "vagina",
  "sodomy",
  "2g1c",
  "2girls1cup",
  "anal",
  "anilingus",
  "anus",
  "arse",
  "erotic",
  "ball",
  "bang",
  "naked",
  "bbw",
  "bdsm",
  "beastiality",
  "breasts",
  "knockers",
  "tits",
  "cock",
  "blowjob",
  "bondage",
  "boner",
  "boob",
  "boobs",
  "booty",
  "bukkake",
  "dyke",
  "butt",
  "cameltoe",
  "camgirl",
  "slut",
  "whore",
  "cialis",
  "clit",
  "clitoris",
]; // List of inappropriate words that cannot be in the username
const MIN_PASSWORD_LENGTH = 8; // Minimum password length for security purposes. See https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/minimum-password-length
const MAX_PASSWORD_LENGTH = 128; // Maximum length of a password
const MIN_PASSWORD_SYMBOLS = 1; // Minimum amount of symbols in the password for security purposes.
const MIN_PASSWORD_UPPERCASE = 1; // Maximum amount of upper case letters in a password
const MIN_PASSWORD_LOWERCASE = 1; // Minimum amount of lower case letters in a password
const MIN_PASSWORD_NUMBERS = 1; // Minimum amount of numbers in a password
const MIN_PASSWORD_SCORE = 45; // Minimum score to be a valid password

/**
 * Checks that the new username is valid size, does not contain inappropriate words and is not already in use
 * @param {String} username is the username to be checked
 * @param {Connection} connection is the connection to the database
 * @returns a string that represents either "Valid" or the error message
 */
async function isValidNewUsername(username, connection) {
  //Check that the username is alphanumeric
  if (!VALIDATOR.isAlphanumeric(username)) {
    let error = new ERRORS.ValidationError();
    error.message = "Username must be alphanumeric";
    throw error;
  }

  // Check that the userName is not too long or to short
  if (
    username.length < MIN_USERNAME_LENGTH ||
    username.length > MAX_USERNAME_LENGTH
  ) {
    let error = new ERRORS.ValidationError();
    error.message = `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters long`;
    throw error;
  }

  // Check that the userName is not inappropriate
  for (let i = 0; i < INAPPROPRIATE_WORDS.length; i++) {
    if (
      VALIDATOR.contains(username, INAPPROPRIATE_WORDS[i], { ignoreCase: true })
    ) {
      let error = new ERRORS.ValidationError();
      error.message = `Username cannot contain the word \"${INAPPROPRIATE_WORDS[i]}\"`;
      throw error;
    }
  }

  // Check that the username is not already in use
  let matchingUsername;
  let matchingUsernameCommand = `SELECT COUNT(*) FROM Users WHERE Username = '${username}'`;
  matchingUsername = await connection
    .execute(matchingUsernameCommand)
    .catch((err) => {
      let error = new ERRORS.DatabaseConnectionError();
      error.message = err.message;
      throw error;
    });

  if (matchingUsername[0][0]["COUNT(*)"] > 0) {
    let error = new ERRORS.ValidationError();
    error.message = "Username already in use";
    throw error;
  }
}

/**
 * Checks that the password is valid size, contains symbols, upper and lower case letters
 * @param {String} password is the password to be checked
 * @returns a string that represents either "Valid" or the error message
 */
function isValidPassword(password) {
  // Check that the password is not too short or too long
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    let error = new ERRORS.ValidationError();
    error.message = `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`;
    throw error;
  }

  // Check that the password is strong enough
  let score = VALIDATOR.isStrongPassword(password, {
    minLowercase: MIN_PASSWORD_LOWERCASE,
    minUppercase: MIN_PASSWORD_UPPERCASE,
    minNumbers: MIN_PASSWORD_NUMBERS,
    MIN_PASSWORD_SYMBOLS: MIN_PASSWORD_SYMBOLS,
    returnScore: true,
  });

  if (score < MIN_PASSWORD_SCORE) {
    let error = new ERRORS.ValidationError();
    error.message = "Password is not strong enough";
    throw error;
  }
}

/**
 * Checks that the new email is valid size, is an email, and is not already in use
 * @param {String} email is the email to be checked
 * @param {Connection} connection is the connection to the database
 * @returns a string that represents either "Valid" or the error message
 */
async function isValidNewEmail(email, connection) {
  // Check that the email is valid
  if (!VALIDATOR.isEmail(email)) {
    let error = new ValidationError();
    error.message = "Email is not valid";
    throw error;
  }

  // Check that the email is not already in use
  let matchingUsername;
  let matchingUsernameCommand = `SELECT COUNT(*) FROM Users WHERE Email = '${email}'`;
  try {
    matchingUsername = await connection.execute(matchingUsernameCommand);
  } catch (err) {
    let error = new ERRORS.DatabaseConnectionError();
    error.message = err.message;
    throw error;
  }
  if (matchingUsername[0][0]["COUNT(*)"] > 0) {
    let error = new ERRORS.ValidationError();
    error.message = "Email already in use";
    throw error;
  }
}

/**
 * Checks that the values given for a new user are valid and not already in use
 * @param {String} username is the username to be checked
 * @param {String} password is the password to be checked
 * @param {String} email is the email to be checked
 * @param {Connection} connection is the connection to the database
 * @returns a string that represents either "Valid" or the error message
 */
async function isValidNewUser(username, password, email, connection) {
  try {
    // Check that the username is valid
    await isValidNewUsername(username, connection);

    // Check that the password is valid
    await isValidPassword(password);

    // Check that the email is valid
    await isValidNewEmail(email, connection);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  isValidNewUsername,
  isValidPassword,
  isValidNewEmail,
  isValidNewUser
};
