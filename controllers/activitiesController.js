const express = require("express");
const { get } = require("express/lib/response");
const logger = require("../logger");
const model = require("../models/activitiesModel");
const userModel = require("../models/usersModel");
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
 * Join activity
 * @param {*} request
 * @param {*} response
 */
async function joinActivity(request, response) {
  logger.info("Activities controller called (join activity)");

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

  let activityID = request.params.id;
  let user = await userModel.getUser(authenticatedSession.userSession.username);

  await model.addUserToActivity(user.UserID, activityID);

  response.redirect("/activity/" + activityID);
}

router.post("/activities/:id/join", joinActivity);


/**
 * Leave activity
 * @param {*} request
 * @param {*} response
 */
 async function leaveActivity(request, response) {
  logger.info("Activities controller called (leave activity)");

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

  let activityID = request.params.id;
  let user = await userModel.getUser(authenticatedSession.userSession.username);

  await model.deleteUserFromActivity(user.UserID, activityID);

  response.redirect("/activity/" + activityID);
}

router.post("/activities/:id/leave", leaveActivity);


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

    let start = Date.parse(request.body.start);
    let end = Date.parse(request.body.end);

    if(start >  end || end < start || isNaN(start) || isNaN(end)) {
      response.render('addActivity.hbs', {error: "Invalid dates", status: 400});
      return;
    }

    let activity = await model.createActivity(name, description, startTime, endTime, ownerID);

    await model.addUserToActivity(activity.ownerID, activity.id[0][0].ActivityID);

    logger.info('User has created an activity');

    response.redirect('/activity/' + activity.id[0][0].ActivityID);
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

      let usersJoined = await model.getUsersInActivity(activity.id);

      let joined = false;

      for(let i = 0; i < usersJoined.length; i++) {
        if(usersJoined[i].Username == session.userSession.username) {
          joined = true;
          break;
        }
      }
      
      response.render("activity.hbs", {message: "Welcome, " + session.userSession.username, activity, username: session.userSession.username, activity: activity, usersJoined: usersJoined, joined: joined});
  
      logger.info("App has shown an activity");
    }
    else {
      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
    }
  }
  catch (error) {
    logger.error(error);
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

      let id = request.params.id;

      let activity = await model.getOneActivity(id);

      var activities;
      var owner;

      if(!activity) {
        activities = await model.getAllActivities();

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

      owner = await userModel.getUsernameByID(activity.OwnerID);

      if(session.userSession.username == owner.Username) {
        logger.info("App has deleted an activity");

        await model.deleteActivity(id);

        activities = await model.getAllActivities();

        for(let i = 0; i < activities.length; i++) {
          owner = await userModel.getUsernameByID(activities[i].OwnerID);

          activities[i] = {
            id: activities[i].ActivityID,
            name: activities[i].Name,
            date: activities[i].StartTime.toString().substr(0, 21),
            host: owner.Username
          }
        }

        response.render("allActivities.hbs", {message: "Activity deleted", username: session.userSession.username, activities: activities});
      } else {
        response.render("allActivities.hbs", {error: "You are not authorized to delete this activity", status: 401, username: session.userSession.username, activities: activities});
      }
    }
    else {
      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
    }
  }
  catch (error) {
    logger.error(error);
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