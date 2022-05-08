const express = require("express");
const { get } = require("express/lib/response");
const logger = require("../logger");
const model = require("../models/activitiesModel");
let userModel = require("../models/usersModel");
const authController = require("./authController");
const router = express.Router();
const routeRoot = "/";

/**
 * Handles GET '/activity'
 * Shows add activity page
 * @param {*} request
 * @param {*} response
 */
async function showAddActivityForm(request, response) {
  logger.info("Activities controller called (add activity page)");

  response.render("addActivity.hbs");
}
router.get("/activity", showAddActivityForm);

/**
 * Handles POST '/activity'
 * Calls the model to create a new activity.
 * @param {*} request
 * @param {*} response
 */
async function createActivity(request, response) {
  let session = authController.authenticateUser(request);
  let user = await userModel.getUser(session.userSession.username);
  
  console.log(request.body);
  let name = request.body.title;
  let description = request.body.description;
  let startTime = request.body.start.substr(0, 10) + " " + request.body.start.substr(11, 15);
  let endTime = request.body.end.substr(0, 10) + " " + request.body.end.substr(11, 15);
  let ownerID = user.UserID;

  console.log(name, description, startTime, endTime, ownerID);

  let activity = await model.createActivity(name, description, startTime, endTime, ownerID);

  console.log(activity);
  logger.info('User has created an activity');

  response.render('activity.hbs', activity);
}
router.post("/activity", createActivity);

/**
 * Handles GET '/activity/:id'
 * Calls the model to show a single activity.
 * @param {*} request
 * @param {*} response
 */
async function showActivity(request, response) {
  try {
    let result = await model.getOneActivity(request.params.id);
    
    let owner = await userModel.getUsernameByID(result.OwnerID);

    let activity = {
      name: result.Name,
      description: result.Description,
      startTime: result.StartTime.toString().substr(0, 21),
      endTime: result.EndTime.toString().substr(0, 21),
      host: owner.Username
  }
  // console.log(request);
  response.render("activity.hbs", activity);
  
  logger.info("App has shown an activity");
  }
  catch (error) {
    logger.error(error);
    console.log(error);
  }
}
router.get("/activity/:id", showActivity);

/**
 * Handles GET '/activities'
 * Calls the model to show all activities.
 * @param {*} request
 * @param {*} response
 */
async function showAllActivities(request, response) {
  try { 
    let result = await model.getAllActivities();

    let activities = [];
    let owner;

    for(let i = 0; i < result.length; i++) {
      owner = await userModel.getUsernameByID(result[i].OwnerID);
      let st = result[i].StartTime;

        activities[i] = {
          id: result[i].ActivityID,
          name: result[i].Name,
          date: result[i].StartTime.toString().substr(0, 21),
          host: owner.Username
        }
    }

    let allActivities = {
      activity: activities
    }

    response.render('allActivities.hbs', allActivities);

    logger.info("App has shown all activities");
  }
  catch (error) {
    console.log(error);
  }
}
router.get("/activities", showAllActivities);

/**
 * Handles DELETE '/activities/:id'
 * Calls the model to delete an activity.
 * @param {*} request
 * @param {*} response
 */
async function deleteActivity(request, response) {
  logger.info("User has deleted an activity");
}
router.delete("/activities/:id", deleteActivity);

module.exports = {
  router,
  routeRoot,
  createActivity,
  showActivity,
  showAllActivities,
  deleteActivity,
  showAddActivityForm,
};