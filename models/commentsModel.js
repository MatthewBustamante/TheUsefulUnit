const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require('../logger');

let connection = DATABASES.getConnection();


module.exports = {
    connection,
};