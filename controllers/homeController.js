const express = require("express");
const router = express.Router();
const routeRoot = '/';
const logger = require('../logger');
const authController = require('../controllers/authController')

/**
 * Renders the home page
 */
function showHome(request, response) {
    logger.info("Home controller called");
    
    const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); //Unauthorized access
        logger.info("User is not logged in");

        response.render("home.hbs");
        
        return;
    }

  logger.info("User " + authenticatedSession.userSession.username + " is logged in");
  
  //response.render('activities.hbs', {message: "Welcome, " + authenticatedSession.userSession.username});
  response.render('home.hbs', {message: "Welcome, " + authenticatedSession.userSession.username});
}

router.get(routeRoot, showHome);
router.get("/home", showHome);

module.exports = {
  router,
  routeRoot,
  showHome,
};
