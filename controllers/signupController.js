const express = require("express");
const router = express.Router();
const routeRoot = "/";
const logger = require("../logger");
const authController = require("./authController");
const tracker = require("../utilities/tracker")

/**
 * Handles GET '/register'
 * Redirects to the signup page.
 * @param {*} request
 * @param {*} response
 */
function showSignupPage(request, response) {
  logger.info("Signup controller called (page)");

  const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        logger.info("Showing signup page");

        response.render("register.hbs");
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");

  //Refresh the cookie to not expire
  authController.refreshSession(request, response)

  response.redirect('/home');
}

router.get("/register", showSignupPage);

module.exports = {
  router,
  routeRoot,
  showSignupPage,
};
