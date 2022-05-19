const DATABASES = require("../utilities/databases");
const validator = require("../utilities/validation");
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
  const connection = DATABASES.getConnection();
  //create a new activity in the database
  const sqlQuery = `INSERT INTO Activities (Name, Description, StartTime, EndTime, OwnerID) VALUES ('${name}', '${description}', '${startTime}', '${endTime}', '${ownerID}')`;
  try {
    await connection.execute(sqlQuery);
    logger.info("Activity created");
  } catch (error) {
    logger.error(error);
    throw error;
  }
  //return the new activity Created
  const sqlQuery2 = `SELECT ActivityID FROM Activities WHERE Name = '${name}' AND Description = '${description}' AND StartTime = '${startTime}' AND EndTime = '${endTime}' AND OwnerID = '${ownerID}'`;
  try {
    const activityID = await connection.execute(sqlQuery2);
    logger.info("Id of the new activity created retrieved");
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
  const connection = DATABASES.getConnection();
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
  const connection = DATABASES.getConnection();
  
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
async function deleteExpiredActivities(){
  //get all the id's of the expired activities
  const connection = DATABASES.getConnection();
  
  const sqlQuery = `SELECT ActivityID FROM Activities WHERE EndTime < CURRENT_TIMESTAMP`;
  let expiredActivitiesIDS;
  try {
    expiredActivitiesIDS = await connection.execute(sqlQuery);
  } catch (error) {
    logger.error(error);
    throw error;
  }

  //delete all the comments that have expiredActivitiesIDS as their activityID
  for(let i = 0; i < expiredActivitiesIDS[0].length; i++){
    
    const sqlQuery2 = `DELETE FROM Comments WHERE ActivityID = ${expiredActivitiesIDS[0][i].ActivityID}`;
    try {
      await connection.execute(sqlQuery2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

   //delete from the UserActivity table all the activities that have expiredActivitiesIDS as their activityID
   for(let i = 0; i < expiredActivitiesIDS[0].length; i++){
    const sqlQuery3 = `DELETE FROM UserActivity WHERE ActivityID = ${expiredActivitiesIDS[0][i].ActivityID}`;
    try {
      await connection.execute(sqlQuery3);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  //delete all the expired activities
  for(let i = 0; i < expiredActivitiesIDS[0].length; i++){
    const sqlQuery3 = `DELETE FROM Activities WHERE ActivityID = ${expiredActivitiesIDS[0][i].ActivityID}`;
    try {
      await connection.execute(sqlQuery3);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  logger.info("Expired activities deleted");
}

/**
 * Gets all the users participating in the given activity
 * @param {*} activityID id of the activity
 * @returns all the users in the given activity
 */
async function getUsersInActivity(activityID) {
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
async function addUserToActivity(userID, activityID) {
  const connection = DATABASES.getConnection();
  const sqlQuery = `INSERT INTO UserActivity (UserID, ActivityID) VALUES (${userID}, ${activityID})`;
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
async function deleteUserFromActivity(userID, activityID) {
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

/**
 * Deletes the activity and its comments with the given activity id
 * @param {*} activityID id of the activity to delete
 */
async function deleteActivity(activityID) {
  const connection = DATABASES.getConnection();
  
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
 * Deletes all activities created by a specific user.
 * @param {*} ownerID The user who created the activities.
 */
async function deleteAllActivities(ownerID) {
  const connection = DATABASES.getConnection();
  const sqlQuery = `DELETE FROM Activities WHERE OwnerID=${ownerID}`;
  try {
    await connection.execute(sqlQuery);
    logger.info("All activities associated with User deleted");
  }
  catch (error) {
    console.log(error);
    logger.error(error);
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
  deleteAllActivities
};