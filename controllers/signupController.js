const express = require('express');
const router = express.Router();
const routeRoot = '/';
const logger = require('../logger');

/**
 * Handles GET '/register'
 * Redirects to the signup page.
 * @param {*} request 
 * @param {*} response 
 */
function showSignupPage(request, response) {
    logger.info('Showing signup page');
    response.render('register.hbs');
}
router.get('/register', showSignupPage);

module.exports = {
    router,
    routeRoot,
    showSignupPage
}