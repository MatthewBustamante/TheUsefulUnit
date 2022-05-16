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

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        response.render("login.hbs", {error: "You must be logged in to perform that action", status: 401});
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  response.render("addActivity.hbs", {message: "Welcome, " + authenticatedSession.userSession.username, username: authenticatedSession.userSession.username});
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

  if(session) {
    //Refresh the cookie to not expire
    authController.refreshSession(request, response);

    let user = await userModel.getUser(session.userSession.username);
  
    let name = request.body.title;
    let description = request.body.description;
    let startTime = request.body.start.substr(0, 10) + " " + request.body.start.substr(11, 15);
    let endTime = request.body.end.substr(0, 10) + " " + request.body.end.substr(11, 15);
    let ownerID = user.UserID;

    let activity = await model.createActivity(name, description, startTime, endTime, ownerID);

    logger.info('User has created an activity');

    response.render('activity.hbs', {message: "Welcome, " + session.userSession.username, activity, username: session.userSession.username});
  }
  else {
    response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
  }
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

    let session = authController.authenticateUser(request);

    if(session) { 
      //Refresh the cookie to not expire
      authController.refreshSession(request, response);

      let result = await model.getOneActivity(request.params.id);

      if(!result) {
        let activities = await model.getAllActivities();
        let owner;

      for(let i = 0; i < activities.length; i++) {
        owner = await userModel.getUsernameByID(activities[i].OwnerID);

        activities[i] = {
          id: activities[i].ActivityID,
          name: activities[i].Name,
          date: activities[i].StartTime.toString().substr(0, 21),
          host: owner.Username
        }
      }

        response.render("allActivities.hbs", {error: "Activity with id " + request.params.id + " was not found", status: 400, username: session.userSession.username, activities: activities});
      }
    
      let owner = await userModel.getUsernameByID(result.OwnerID);

      let activity = {
        name: result.Name,
        description: result.Description,
        startTime: result.StartTime.toString().substr(0, 21),
        endTime: result.EndTime.toString().substr(0, 21),
        host: owner.Username,
        id: result.ActivityID
      }
      
      response.render("activity.hbs", {message: "Welcome, " + session.userSession.username, activity, username: session.userSession.username, activity: activity});
  
      logger.info("App has shown an activity");
    }
    else {
      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
    }
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
    let session = authController.authenticateUser(request);

    if(session) {
      //Refresh the cookie to not expire
      authController.refreshSession(request, response);

      let activities = await model.getAllActivities();
      let owner;

      for(let i = 0; i < activities.length; i++) {
        owner = await userModel.getUsernameByID(activities[i].OwnerID);

        activities[i] = {
          id: activities[i].ActivityID,
          name: activities[i].Name,
          date: activities[i].StartTime.toString().substr(0, 21),
          host: owner.Username
        }
      }

      response.render('allActivities.hbs', {activities: activities, message: "Welcome, " + session.userSession.username, username: session.userSession.username});

      logger.info("App has shown all activities");
    }
    else {
      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
    }
  }
  catch (error) {
    logger.error(error);
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
  try {
    let session = authController.authenticateUser(request);

    if (session) {
      //Refresh the cookie to not expire
      authController.refreshSession(request, response);

      let id = request.url.charAt(request.url.length - 1);

      await model.deleteActivity(id);

      response.render('home.hbs', {message: "Activity deleted", username: session.userSession.username});

      logger.info("App has deleted an activity");
    }
    else {
      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
    }
  }
  catch (error) {
    logger.error(error);
    console.log(error);
  }
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