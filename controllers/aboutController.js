const express = require("express");
const router = express.Router();
const routeRoot = "/";
const authController = require("./authController");
const logger = require("../logger");
const tracker = require("../utilities/tracker")
const themeController = require("../controllers/themeController");

/**
 * Handles GET '/about'
 * Redirects the user to an about page.
 */
function showAbout(request, response) {
  logger.info("Showing About page");

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

    metrics.pageVisited = "About Page"
    metrics.user = "Guest (Not logged in)";
    metrics.action = "None";

    tracker.updateTracker(request, response, metrics);

    let isDarkMode = themeController.IsDarkMode(request);

    response.render("about.hbs", {isDarkMode: isDarkMode});

    return;
  }

  logger.info("Showing about page");

  logger.info(
    "User " + authenticatedSession.userSession.username + " is logged in"
  );

  metrics.pageVisited = "About Page"
  metrics.user = authenticatedSession.userSession.username;
  metrics.action = "None";

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  let isDarkMode = themeController.IsDarkMode(request);

  tracker.updateTracker(request, response, metrics);

  response.render("about.hbs", { username: authenticatedSession.userSession.username, isDarkMode: isDarkMode });
}

router.get("/about", showAbout);

module.exports = {
  router,
  routeRoot,
  showAbout,
};
