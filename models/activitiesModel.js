const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const logger = require("../utilities/logger");

let connection = DATABASES.connection;

module.exports = {
    initialize,
    connection
}