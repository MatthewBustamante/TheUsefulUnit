const express = require("express");
const router = express.Router();
const routeRoot = "/";
const logger = require("../logger");
const authController = require("./authController");
const userModel = require("../models/usersModel")
const activityModel = require("../models/activitiesModel")

/**
 * Renders the home page with error message and status code
 */
async function showError(request, response) {
  logger.error("Error controller called (Invalid URL)");

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        response.render("home.hbs", {error: "Invalid URL", status: response.statusCode});
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  response.status(404);

  let activities = await activityModel.getAllActivities();
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

  response.render("allActivities.hbs", {error: "Invalid URL", status: response.statusCode, username: authenticatedSession.userSession.username, activities: activities});
}

router.all("*", showError);

module.exports = {
  router,
  routeRoot,
};
