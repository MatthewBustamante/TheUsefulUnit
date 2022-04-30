const DATABASES = require("../utilities/databases");
const logger = require('../logger');
const validator = require("../utilities/validation");
const bcrypt = require('bcrypt');
const saltRounds = 10;

let connection = DATABASES.connection;

async function createUser(identifier, unhashedpassword) {
    logger.info("User model called (create user)");

    //validate username/email and password with validator

    //check if user exists already

    //hash the password using bcrypt, store it along with the username inside the database
    //see exercise 6.2 for instructions on how to do this
}

async function getUser(identifier) {
    logger.info("User model called (get user)");
}

module.exports = {
    createUser,
    getUser
}