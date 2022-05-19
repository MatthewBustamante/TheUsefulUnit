const express = require("express");
const router = express.Router();
const routeRoot = "/";
const logger = require("../logger");
const authController = require("./authController");
const themeController = require("../controllers/themeController");

/**
 * Renders the login page
 */
function showLoginForm(request, response) {
  logger.info("Login controller called (page)");

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        logger.info("Showing signup page");
        let isDarkMode = themeController.IsDarkMode(request);
        response.render("login.hbs", { isDarkMode: isDarkMode });
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  //Refresh the cookie to not expire
  authController.refreshSession(request, response)

  response.redirect('/home');
}

router.get("/login", showLoginForm);

module.exports = {
  router,
  routeRoot,
};
