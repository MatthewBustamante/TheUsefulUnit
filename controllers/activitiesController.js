const express = require("express");
const { get } = require("express/lib/response");
const logger = require("../logger");
const model = require("../models/activitiesModel");
const userModel = require("../models/usersModel");
const commentsModel = require("../models/commentsModel");
const authController = require("./authController");
const router = express.Router();
const ERRORS = require("../utilities/errors");
const routeRoot = "/";
const tracker = require("../utilities/tracker")

/**
 * Handles GET '/activity'
 * Shows add activity page
 * @param {*} request
 * @param {*} response
 */
async function showAddActivityForm(request, response) {
  logger.info("Activities controller called (add activity page)");

  //Tracking user agent
  let ua = request.headers['user-agent'];

  //Tracking metrics
  var metrics = {
    pageVisited: "Add Activities Page",
    visitedAt: new Date(),
    pageVisitLength: null,
    user: null,
    action: "None",
    userAgent: ua
  };

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        metrics.user = "Guest (Not logged in)";

        response.status(401)

        tracker.updateTracker(request, response, metrics);

        response.render("login.hbs", {error: "You must be logged in to perform that action", status: 401});
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  metrics.user = authenticatedSession.userSession.username;

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  tracker.updateTracker(request, response, metrics);

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

  //Tracking user agent
  let ua = request.headers['user-agent'];

  //Tracking metrics
  var metrics = {
    pageVisited: "None [User Attempted CRUD Action]",
    visitedAt: new Date(),
    pageVisitLength: null,
    user: null,
    action: "Join activity",
    userAgent: ua
  };

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        metrics.user = "Guest (Not logged in)";

        response.status(401);

        tracker.updateTracker(request, response, metrics);

        response.render("login.hbs", {error: "You must be logged in to perform that action", status: 401});
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  metrics.user = authenticatedSession.userSession.username;

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  let activityID = request.params.id;
  let user = await userModel.getUser(authenticatedSession.userSession.username);

  await model.addUserToActivity(user.UserID, activityID);

  tracker.updateTracker(request, response, metrics);

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

  //Tracking user agent
  let ua = request.headers['user-agent'];

  //Tracking metrics
  var metrics = {
    pageVisited: "None [User Attempted CRUD Action]",
    visitedAt: new Date(),
    pageVisitLength: null,
    user: null,
    action: "Leave activity",
    userAgent: ua
  };

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        metrics.user = "Guest (Not logged in)";

        response.status(401)

        tracker.updateTracker(request, response, metrics);

        response.render("login.hbs", {error: "You must be logged in to perform that action", status: 401});
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  metrics.user = authenticatedSession.userSession.username;

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  let activityID = request.params.id;
  let user = await userModel.getUser(authenticatedSession.userSession.username);

  await model.deleteUserFromActivity(user.UserID, activityID);

  tracker.updateTracker(request, response, metrics);

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
  //Tracking user agent
  let ua = request.headers['user-agent'];

  //Tracking metrics
  var metrics = {
    pageVisited: "None [User Attempted CRUD Action]",
    visitedAt: new Date(),
    pageVisitLength: null,
    user: null,
    action: "Create activity",
    userAgent: ua
  };
  
  let session = authController.authenticateUser(request);

  if(session) {
    //Refresh the cookie to not expire
    authController.refreshSession(request, response);

    metrics.user = session.userSession.username;

    let user = await userModel.getUser(session.userSession.username);
  
    let name = request.body.title;
    let description = request.body.description;
    let startTime = request.body.start.substr(0, 10) + " " + request.body.start.substr(11, 15);
    let endTime = request.body.end.substr(0, 10) + " " + request.body.end.substr(11, 15);
    let ownerID = user.UserID;

    let start = Date.parse(request.body.start);
    let end = Date.parse(request.body.end);

    if(isNaN(start) || isNaN(end) || start == end || start > end || end < start) {
      response.status(400);

      tracker.updateTracker(request, response, metrics);

      response.render('addActivity.hbs', {error: "Invalid dates (cannot be the same, start must be before end)", status: 400, username: session.userSession.username});
      return;
    }

    let activity = await model.createActivity(name, description, startTime, endTime, ownerID);

    await model.addUserToActivity(activity.ownerID, activity.id[0][0].ActivityID);

    logger.info('User has created an activity');

    tracker.updateTracker(request, response, metrics);

    response.redirect('/activity/' + activity.id[0][0].ActivityID);
  }
  else {
    metrics.user = "Guest (Not logged in)";

    response.status(401);

    tracker.updateTracker(request, response, metrics);

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
    //Tracking user agent
    let ua = request.headers['user-agent'];

    //Tracking metrics
    var metrics = {
      pageVisited: "Activity page",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "Read single activity",
      userAgent: ua
    };

    let session = authController.authenticateUser(request);

    if(session) { 
      //Refresh the cookie to not expire
      authController.refreshSession(request, response);

      metrics.user = session.userSession.username;

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

        response.status(400)

        tracker.updateTracker(request, response, metrics);

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

      let comments = await commentsModel.getAllComments(activity.id);
      
      for(let i = 0; i < comments.length; i++) {
        owner = await userModel.getUsernameByID(comments[i].UserID);

       comments[i] = {
          commentID: comments[i].CommentID,
          text: comments[i].Comment,
          date: comments[i].Date.toString().substr(0, 21),
          user: owner.Username,
        }
      }
      
      let usersJoined = await model.getUsersInActivity(activity.id);

      let joined = false;

      for(let i = 0; i < usersJoined.length; i++) {
        if(usersJoined[i].Username == session.userSession.username) {
          joined = true;
          break;
        }
      }

      tracker.updateTracker(request, response, metrics);
      
      response.render("activity.hbs", {message: "Welcome, " + session.userSession.username, username: session.userSession.username, activity: activity, usersJoined: usersJoined, joined: joined, comments: comments});
  
      logger.info("App has shown an activity");
    }
    else {
      metrics.user = "Guest (Not logged in)";

      response.status(401);

      tracker.updateTracker(request, response, metrics);

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

    //Tracking user agent
    let ua = request.headers['user-agent'];

    //Tracking metrics
    var metrics = {
      pageVisited: "All activities page",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "Read all activities",
      userAgent: ua
    };

    let session = authController.authenticateUser(request);

    if(session) {
      //Refresh the cookie to not expire
      authController.refreshSession(request, response);

      metrics.user = session.userSession.username;

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

      tracker.updateTracker(request, response, metrics);

      response.render('allActivities.hbs', {activities: activities, message: "Welcome, " + session.userSession.username, username: session.userSession.username});

      logger.info("App has shown all activities");
    }
    else {
      response.status(401)

      metrics.user = "Guest (Not logged in)";

      tracker.updateTracker(request, response, metrics);

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

    //Tracking user agent
    let ua = request.headers['user-agent'];

    //Tracking metrics
    var metrics = {
      pageVisited: "None [User Attempted CRUD Action]",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "Delete activity",
      userAgent: ua
    };

    if (session) {
      //Refresh the cookie to not expire
      authController.refreshSession(request, response);

      metrics.user = session.userSession.username;

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
        response.status(401);

        response.render("allActivities.hbs", {error: "You are not authorized to delete this activity", status: 401, username: session.userSession.username, activities: activities});
      }
    }
    else {

      metrics.user = "Guest (Not logged in)";
      response.status(401);

      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
    }
  }
  catch (error) {
    logger.error(error);
  }
}
router.delete("/activities/:id", deleteActivity);

async function addComment(request, response) {

  try {
    let session = authController.authenticateUser(request);

    if(session) {

      authController.refreshSession(request, response);

      let user = await userModel.getUser(session.userSession.username);
      let activityID = request.originalUrl.charAt(request.originalUrl.length - 1 )

      await commentsModel.createComment(user.UserID, activityID, request.body.comment);
      
      response.redirect("/activity/" + activityID);
    }
  } catch (error) {
    let customError = new ERRORS.DatabaseReadError(error.message);
    logger.error(customError);
    throw customError;
  }
}
router.post("/comments/:id", addComment);

async function deleteComment(request, response) {
  try {
    let session = authController.authenticateUser(request);
    
    if(session) {
      const authenticatedSession = authController.authenticateUser(request);
      
      authController.refreshSession(request, response);

      let commentID = request.params.id;

      let activityID = await commentsModel.getActivityFromCommentID(commentID);
      
      await commentsModel.deleteComment(commentID);

      response.redirect("/activity/" + activityID[0][0].ActivityID);
    }
  }
  catch (error) {
    console.log(error);
    let customError = new ERRORS.DatabaseReadError(error.message);
    logger.error(customError);
    throw customError;
  }
}
router.delete("/comments/:id", deleteComment);

module.exports = {
  router,
  routeRoot,
  createActivity,
  showActivity,
  showAllActivities,
  deleteActivity,
  showAddActivityForm,
  addComment,
  deleteComment
};