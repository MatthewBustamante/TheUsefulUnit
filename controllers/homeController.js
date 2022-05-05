const express = require('express');
const router = express.Router();
const routeRoot = '/';
const logger = require('../logger');

/**
 * Renders the home page
 */
function showHome(request, response) {
    logger.info("Home controller called");

    response.render('home.hbs');
}

router.get(routeRoot, showHome);
router.get("/home", showHome);

/**
 * Handles GET '/about'
 * Redirects the user to an about page.
 */
 function showAbout(request, response) {
    logger.info("Showing About page");

    response.render('about.hbs');
}

router.get("/about", showAbout);

module.exports = {
    router,
    routeRoot,
    showHome,
    showAbout
}