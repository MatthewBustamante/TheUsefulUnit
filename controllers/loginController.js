const express = require('express');
const router = express.Router();
const routeRoot = '/';
const logger = require('../logger');

/**
 * Renders the login page
 */
function showLoginForm(request, response) {
    logger.info("Login controller called (page)");

    response.render('login.hbs');
}

router.get("/login", showLoginForm);

module.exports = {
    router,
    routeRoot
}