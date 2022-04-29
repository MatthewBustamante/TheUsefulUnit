const express = require('express');
const router = express.Router();
const routeRoot = '/';
const logger = require('../logger');

/**
 * Renders the home page with error message and status code
 */
function showError(request, response) {
    logger.error("Error controller called (Invalid URL)")
    
    response.status(404)
    response.render("home.hbs", {error: "Invalid URL", status: response.statusCode})
}

router.all('*', showError);

module.exports = {
    router,
    routeRoot
}