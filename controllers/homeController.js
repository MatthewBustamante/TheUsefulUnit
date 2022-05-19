const express = require("express");
const router = express.Router();
const routeRoot = '/';
const logger = require('../logger');
const authController = require('../controllers/authController')
const activityModel = require('../models/activitiesModel')
const userModel = require('../models/usersModel')
const tracker = require("../utilities/tracker")
const themeController = require("../controllers/themeController");

/**
 * Renders the home page
 */
async function showHome(request, response) {
    logger.info("Home controller called");

    //Tracking user agent
    let ua = request.headers['user-agent'];

    //Tracking metrics
    var metrics = {
      pageVisited: "",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: null,
      userAgent: ua
    };
    
    const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        metrics.pageVisited = "Home Page - Welcome"
        metrics.user = "Guest (Not logged in)";
        metrics.action = "None";

        tracker.updateTracker(request, response, metrics);

        response.render("home.hbs");
        
        return;
    }

  if (!authenticatedSession) {
    //response.sendStatus(401); //Unauthorized access
    logger.info("User is not logged in");
    let isDarkMode = themeController.IsDarkMode(request);
    response.render("home.hbs", { isDarkMode: isDarkMode });

    return;
  }

  logger.info(
    "User " + authenticatedSession.userSession.username + " is logged in"
  );

  metrics.pageVisited = "Home Page - Activities"
  metrics.user = authenticatedSession.userSession.username;
  metrics.action = "Read All Activities";

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  tracker.updateTracker(request, response, metrics);
  
  response.redirect("/activities")
}

router.get(routeRoot, showHome);
router.get("/home", showHome);

module.exports = {
  router,
  routeRoot,
  showHome,
};
