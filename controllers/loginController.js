const express = require("express");
const router = express.Router();
const routeRoot = "/";
const logger = require("../logger");
const authController = require("./authController");
const tracker = require("../utilities/tracker")

/**
 * Renders the login page
 */
function showLoginForm(request, response) {
  logger.info("Login controller called (page)");

  //Tracking user agent
  let ua = request.headers['user-agent'];

  //Tracking metrics
  var metrics = {
    pageVisited: "Log in Page",
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

        logger.info("Showing signup page");

        tracker.updateTracker(request, response, metrics);

        response.render("login.hbs");
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  metrics.user = authenticatedSession.userSession.username;

  //Refresh the cookie to not expire
  authController.refreshSession(request, response)

  tracker.updateTracker(request, response, metrics);

  response.redirect('/home');
}

router.get("/login", showLoginForm);

module.exports = {
  router,
  routeRoot,
};
