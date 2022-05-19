const express = require("express");
const router = express.Router();
const routeRoot = "/";
const authController = require("./authController");
const logger = require("../logger");
const themeController = require("../controllers/themeController");

/**
 * Handles GET '/about'
 * Redirects the user to an about page.
 */
function showAbout(request, response) {
  logger.info("Showing About page");

  const authenticatedSession = authController.authenticateUser(request);

  if (!authenticatedSession) {
    //response.sendStatus(401); //Unauthorized access
    logger.info("User is not logged in");

    logger.info("Showing about page");

    let isDarkMode = themeController.IsDarkMode(request);

    response.render("about.hbs", { isDarkMode: isDarkMode });

    return;
  }

  logger.info(
    "User " + authenticatedSession.userSession.username + " is logged in"
  );

  //Refresh the cookie to not expire
  authController.refreshSession(request, response);

  let isDarkMode = themeController.IsDarkMode(request);

  response.render("about.hbs", {
    message: "Welcome, " + authenticatedSession.userSession.username,
    username: authenticatedSession.userSession.username,
    isDarkMode: isDarkMode,
  });
}

router.get("/about", showAbout);

module.exports = {
  router,
  routeRoot,
  showAbout,
};
