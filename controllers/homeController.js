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

module.exports = {
    router,
    routeRoot
}