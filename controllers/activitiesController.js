const express = require("express");
const logger = require("../logger");
const model = require("../models/activitiesModel");
const router = express.Router();
const routeRoot = "/";

/**
 * Handles GET '/activity'
 * Shows add activity page
 * @param {*} request
 * @param {*} response
 */
async function showAddActivityForm(request, response) {
  logger.info("Activities controller called (add activity page)");

  response.render("addActivity.hbs");
}
router.get("/activity", showAddActivityForm);

/**
 * Handles POST '/activity'
 * Calls the model to create a new activity.
 * @param {*} request
 * @param {*} response
 */
async function createActivity(request, response) {
  logger.info("User has created an activity");
}
router.post("/activity", createActivity);

/**
 * Handles GET '/activity/:id'
 * Calls the model to show a single activity.
 * @param {*} request
 * @param {*} response
 */
async function showActivity(request, response) {
  logger.info("App has shown an activity");
}
router.get("/activity/:id", showActivity);

/**
 * Handles GET '/activities'
 * Calls the model to show all activities.
 * @param {*} request
 * @param {*} response
 */
async function showAllActivities(request, response) {
  logger.info("App has shown all activities");
}
router.get("/activities", showAllActivities);

/**
 * Handles DELETE '/activities/:id'
 * Calls the model to delete an activity.
 * @param {*} request
 * @param {*} response
 */
async function deleteActivity(request, response) {
  logger.info("User has deleted an activity");
}
router.delete("/activities/:id", deleteActivity);

module.exports = {
  router,
  routeRoot,
  createActivity,
  showActivity,
  showAllActivities,
  deleteActivity,
  showAddActivityForm,
};
