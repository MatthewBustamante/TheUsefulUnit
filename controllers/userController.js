const express = require('express');
const { P } = require('pino');
const model = require('../models/usersModel');
const router = express.Router();
const routeRoot = '/';

/**
 * Handles GET '/register'
 * Directs the user to the sign-up page.
 * @param {*} request 
 * @param {*} response 
 */
async function showRegisterForm(request, response) {

}
router.get('/register', showRegisterForm);

/**
 * Handles POST '/register'
 * Creates a new user account.
 * @param {*} request 
 * @param {*} response 
 */
async function createUser(request, response) {

}
router.post('/register', createUser);

/**
 * Handles GET '/login'
 * Directs the user to the login form.
 * @param {*} request 
 * @param {*} response 
 */
async function showLoginForm(request, response) {

}
router.get('/login', showLoginForm);

/**
 * Handles POST '/login'
 * Authenticates the user when logging in.
 * @param {*} request 
 * @param {*} response 
 */
async function authenticateUser(request, response) {

}
router.post('/login', authenticateUser);

/**
 * Handles GET '/user'
 * Redirects to the user account page.
 * @param {*} request 
 * @param {*} response 
 */
async function showUser(request, response) {

}
router.get('/user', showUser);

/**
 * Handles PUT '/users/:id'
 * Calls the model to update user account settings.
 * @param {*} request 
 * @param {*} response 
 */
async function updateUser(request, response) {

}
router.put('/users/:id', updateUser);

/**
 * Handles DELETE '/users/:id'
 * Calls the model to delete a user account.
 * @param {*} request 
 * @param {*} response 
 */
async function deleteUser(request, response) {

}
router.delete('/users/:id', deleteUser);

module.exports = {
    router,
    routeRoot,
    showRegisterForm,
    createUser,
    showLoginForm,
    authenticateUser,
    showUser,
    updateUser,
    deleteUser
}