const express = require('express');
const logger = require('../logger');
const model = require('../models/usersModel');

//Used to refresh session and authenticate pages/actions
const authController = require('../controllers/authController');

const router = express.Router();
const routeRoot = '/';

/**
 * Handles GET '/user'
 * Redirects to the user account page.
 * @param {*} request 
 * @param {*} response 
 */
async function showUser(request, response) {
    logger.info('Showing user account page');
}
router.get('/user', showUser);

/**
 * Handles PUT '/users/:id'
 * Calls the model to update user account settings.
 * @param {*} request 
 * @param {*} response 
 */
async function updateUser(request, response) {
    logger.info('Updating user settings');
}
router.put('/users/:id', updateUser);

/**
 * Handles DELETE '/users/:id'
 * Calls the model to delete a user account.
 * @param {*} request 
 * @param {*} response 
 */
async function deleteUser(request, response) {
    logger.info('Deleting user');
}
router.delete('/users/:id', deleteUser);

module.exports = {
    router,
    routeRoot,
    createUser,
    authenticateUser,
    showUser,
    updateUser,
    deleteUser
}
