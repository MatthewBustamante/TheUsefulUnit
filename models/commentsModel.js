const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const logger = require("../utilities/logger");

async function getAllComments(activityID){
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

module.exports = {
    getAllComments,
}