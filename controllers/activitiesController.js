const express = require('express');
const pino = require('pino');
const model = require('../models/activitiesModel');
const router = express.Router();
const routeRoot = '/';

/**
 * Handles POST '/activity'
 * Calls the model to create a new activity.
 * @param {*} request 
 * @param {*} response 
 */
async function createActivity(request, response) {

}
router.post('/activity', createActivity);

/**
 * Handles GET '/activity/:id'
 * Calls the model to show a single activity.
 * @param {*} request 
 * @param {*} response 
 */
async function showActivity(request, response) {

}
router.get('/activity/:id', showActivity);

/**
 * Handles GET '/activities'
 * Calls the model to show all activities.
 * @param {*} request 
 * @param {*} response 
 */
async function showAllActivities(request, response) {

}
router.get('/activities', showAllActivities);

/**
 * Handles DELETE '/activities/:id'
 * Calls the model to delete an activity.
 * @param {*} request 
 * @param {*} response 
 */
async function deleteActivity(request, response) {

}
router.delete('/activities/:id', deleteActivity);

module.exports = {
    router,
    routeRoot,
    createActivity,
    showActivity,
    showAllActivities,
    deleteActivity
}
