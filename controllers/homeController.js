const express = require("express");
const router = express.Router();
const routeRoot = '/';
const logger = require('../logger');
const authController = require('../controllers/authController')
const activityModel = require('../models/activitiesModel')
const userModel = require('../models/usersModel')

/**
 * Renders the home page
 */
async function showHome(request, response) {
    logger.info("Home controller called");
    
    const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        response.render("home.hbs");
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

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
  
  response.status(201).render('allActivities.hbs', {activities: activities, message: "Welcome, " + authenticatedSession.userSession.username, username: authenticatedSession.userSession.username});
}

router.get(routeRoot, showHome);
router.get("/home", showHome);

module.exports = {
  router,
  routeRoot,
  showHome,
};
