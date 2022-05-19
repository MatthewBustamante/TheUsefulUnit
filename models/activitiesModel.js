const DATABASES = require("../utilities/databases");
const ERRORS = require("../utilities/errors");
const logger = require("../utilities/logger");

/**
 * Creates a new activity in the database
 * @param {*} name name of the new activity
 * @param {*} description description of the new activity
 * @param {*} startTime start time of the new activity
 * @param {*} endTime end time of the new activity
 * @param {*} ownerID the id of the owner of the new activity
 * @returns the new activity object
 */
async function createActivity(name, description, startTime, endTime, ownerID) {
  //FINISHED TEST
  const connection = DATABASES.getConnection();

  // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }

  await connection
    .execute(
      `INSERT INTO Activities (Name, Description, StartTime, EndTime, OwnerID) VALUES (?, ?, ?, ?, ?);`,
      [name, description, startTime, endTime, ownerID]
    )
    .then(logger.info("Successfully created activity [model]"))
    .catch((error) => {
      logger.error(new ERRORS.DatabaseWriteError(error));
    });

  const activityID = await connection
    .execute(
      `SELECT ActivityID FROM Activities WHERE Name = ? AND Description = ? AND StartTime = ? AND EndTime = ? AND OwnerID = ?;`,
      [name, description, startTime, endTime, ownerID]
    )
    .then(logger.info("Id of the new activity created retrieved [model]"))
    .catch((error) => {
      logger.error(new ERRORS.DatabaseWriteError(error));
    });

  //return the new activity Created
  //const sqlQuery2 = `SELECT ActivityID FROM Activities WHERE Name = '${name}' AND Description = '${description}' AND StartTime = '${startTime}' AND EndTime = '${endTime}' AND OwnerID = '${ownerID}'`;
  try {
    //const activityID = await connection.execute(sqlQuery2);
    //logger.info("Id of the new activity created retrieved");
    return {
      id: activityID,
      name: name,
      description: description,
      startTime: startTime,
      endTime: endTime,
      ownerID: ownerID,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Gets the activity with the given id
 * @param {*} activityID id of the activity to fetch
 * @returns the activity with the given id
 */
async function getOneActivity(activityID) {
  //FINISHED TEST
  const connection = DATABASES.getConnection();

  // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }

  const sqlQuery = `SELECT * FROM Activities WHERE ActivityID = ${activityID}`;
  try {
    const result = await connection.execute(sqlQuery);
    return result[0][0];
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Gets all the activities in the database
 * @returns all the activities in the database
 */
async function getAllActivities() {
  //FINISHED TEST
  const connection = DATABASES.getConnection();

  // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }

  //method that deletes all the expired activities and their comments
  deleteExpiredActivities();

  const sqlQuery = `SELECT * FROM Activities`;
  try {
    const result = await connection.execute(sqlQuery);
    return result[0];
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

/**
 * Deletes all the expired activities and their comments
 */

async function deleteExpiredActivities() {
  //FINISHED TEST
  //get all the id's of the expired activities
  const connection = DATABASES.getConnection();

  // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }

 const sqlQuery = `SELECT ActivityID FROM Activities WHERE EndTime < NOW()`;
  let expiredActivitiesIDS;
  try {
    expiredActivitiesIDS = await connection.execute(sqlQuery);
  } catch (error) {
    logger.error(error);
    throw error;
  }

  //check if the expired activities really are expired
  for (let i = 0; i < expiredActivitiesIDS[0].length; i++) {
    const sqlQuery2 = `SELECT * FROM Activities WHERE ActivityID = ${expiredActivitiesIDS[0][i].ActivityID}`;
    let expiredActivity;

    try {
      expiredActivity = await connection.execute(sqlQuery2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
    if (expiredActivity[0][0].EndTime < new Date()) {
      //delete the expired activity's comments
      const sqlQuery3 = `DELETE FROM Comments WHERE ActivityID = ${expiredActivitiesIDS[0][i].ActivityID}`;
      try {
        await connection.execute(sqlQuery3);
      } catch (error) {
        logger.error(error);
        throw error;
      }
      //delete from the UserActivity table all the activities that have expiredActivitiesIDS as their activityID
      const sqlQuery4 = `DELETE FROM UserActivity WHERE ActivityID = ${expiredActivitiesIDS[0][i].ActivityID}`;
      try {
        await connection.execute(sqlQuery4);
      } catch (error) {
        logger.error(error);
        throw error;
      }

      //delete the expired activity
      const sqlQuery5 = `DELETE FROM Activities WHERE ActivityID = ${expiredActivitiesIDS[0][i].ActivityID}`;
      try {
        await connection.execute(sqlQuery5);
      } catch (error) {
        logger.error(error);
        throw error;
      }
      logger.info("Expired activities deleted");
    }
    
  }
}

  /**
   * Gets all the users participating in the given activity
   * @param {*} activityID id of the activity
   * @returns all the users in the given activity
   */
  async function getUsersInActivity(activityID) {                  //FINISHED TEST
    const connection = DATABASES.getConnection();
    const sqlQuery = `SELECT Username FROM Users WHERE UserID IN (SELECT UserID from UserActivity where ActivityID = ${activityID})`;

    try {
      const result = await connection.execute(sqlQuery);
      return result[0];
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * Adds the given user to the given activity
   * @param {*} userID id of the user to add to the activity
   * @param {*} activityID id of the activity to add the user to
   */
  async function addUserToActivity(userID, activityID) {               //FINISHED TEST
    const connection = DATABASES.getConnection();
    const sqlQuery = `INSERT INTO UserActivity (UserID, ActivityID) VALUES (${userID}, ${activityID})`;

    // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }
    
    try {
      await connection.execute(sqlQuery);
      logger.info("User added to the given activity");
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * Deletes the user from the given activity
   * @param {*} userID id of the user to delete from the activity
   * @param {*} activityID id of the activity to delete the user from
   */
  async function deleteUserFromActivity(userID, activityID) {          //FINISHED TEST
    const connection = DATABASES.getConnection();
     // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }
    const sqlQuery = `DELETE FROM UserActivity WHERE UserID = ${userID} AND ActivityID = ${activityID}`;
    try {
      await connection.execute(sqlQuery);
      logger.info("User deleted from the given activity");
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * Deletes the activity and its comments with the given activity id
   * @param {*} activityID id of the activity to delete
   */
  async function deleteActivity(activityID) {                           //FINISHED TEST
    const connection = DATABASES.getConnection();

    // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }
    
    //delete all the comments that have the activityID as their activityID
    const sqlQuery = `DELETE FROM Comments WHERE ActivityID = ${activityID}`;
    try {
      await connection.execute(sqlQuery);
    }
    catch (error) {
      logger.error(error);
      throw error;
    }

    //delete the activity from the UserActivity table
    const sqlQuery2 = `DELETE FROM UserActivity WHERE ActivityID = ${activityID}`;
    try {
      await connection.execute(sqlQuery2);
    }
    catch (error) {
      logger.error(error);
      throw error;
    }

    //delete the activity
    const sqlQuery3 = `DELETE FROM Activities WHERE ActivityID = ${activityID}`;
    try {
      await connection.execute(sqlQuery3);
      logger.info("Activity deleted");
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

/**
 * Deletes the user from the given activity
 * @param {*} userID id of the user to delete from the activity
 * @param {*} activityID id of the activity to delete the user from
 */
async function deleteUserFromActivity(userID, activityID) {
  //FINISHED TEST
  const connection = DATABASES.getConnection();

  const sqlQuery = `DELETE FROM UserActivity WHERE UserID = ${userID} AND ActivityID = ${activityID}`;
  try {
    await connection.execute(sqlQuery);
    logger.info("User deleted from the given activity");
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

  }

  /**
   * Gets all the activities that the given user has joined
   * @param {*} userID id of the user to fetch their joined activities
   * @returns returns all the activities that the given user has joined
   */
  async function getJoinedActivities(userID) {
    const connection = DATABASES.getConnection();
     // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }
    const sqlQuery = `SELECT * FROM Activities WHERE ActivityID IN (SELECT ActivityID from UserActivity where UserID = ${userID})`;
    try {
      const result = await connection.execute(sqlQuery);
      return result[0];
    } catch (error) {
      logger.error(error);
      throw error;
    }

  }

  /**
   * Gets all the activities that the given user has created
   * @param {*} ownerID id of the owner of the activities
   * @returns all the activities that the given owner owns
   */
  async function getOwnedActivities(ownerID) {                          //FINISHED TEST
    const connection = DATABASES.getConnection();
    // Check that the connection is not null
  if (connection === null) {
    throw new ERRORS.DatabaseConnectionError("Database connection is null");
  }

    const sqlQuery = `SELECT * FROM Activities WHERE OwnerID = ${ownerID}`;
    try {
      const result = await connection.execute(sqlQuery);
      return result[0];
    } catch (error) {
      logger.error(error);
      throw error;
    }

  }


module.exports = {
  createActivity,
  getOneActivity,
  getAllActivities,
  getUsersInActivity,
  addUserToActivity,
  deleteUserFromActivity,
  deleteActivity,
  getJoinedActivities,
  getOwnedActivities,
  deleteExpiredActivities,
};
