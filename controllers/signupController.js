const express = require("express");
const router = express.Router();
const routeRoot = "/";
const logger = require("../logger");
const authController = require("./authController");
const tracker = require("../utilities/tracker")
const themeController = require("../controllers/themeController");

/**
 * Handles GET '/register'
 * Redirects to the signup page.
 * @param {*} request
 * @param {*} response
 */
function showSignupPage(request, response) {
  logger.info("Signup controller called (page)");

  //Tracking user agent
  let ua = request.headers['user-agent'];

  //Tracking metrics
  var metrics = {
    pageVisited: "Register Page",
    visitedAt: new Date(),
    pageVisitLength: null,
    user: "Guest (Not logged in)",
    action: "None",
    userAgent: ua
  };

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        logger.info("Showing signup page");

        tracker.updateTracker(request, response, metrics);
       
        let isDarkMode = themeController.IsDarkMode(request);
        response.render("register.hbs", { isDarkMode: isDarkMode });
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  //Refresh the cookie to not expire
  authController.refreshSession(request, response)

  tracker.updateTracker(request, response, metrics);

  response.redirect('/home');
}

router.get("/register", showSignupPage);

module.exports = {
  router,
  routeRoot,
  showSignupPage,
};
