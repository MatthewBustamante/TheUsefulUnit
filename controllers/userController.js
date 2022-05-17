const express = require("express");
const logger = require("../logger");
const model = require("../models/usersModel");
const activitiesModel = require("../models/activitiesModel");
const methodOverride = require('method-override');

//Used to refresh session and authenticate pages/actions
const authController = require("../controllers/authController");
const bcrypt = require("bcrypt");

const router = express.Router();
router.use(methodOverride('_method'));
const routeRoot = "/";

/**
 * Handles GET '/user'
 * Redirects to the user account page.
 * @param {*} request
 * @param {*} response
 */
async function showUser(request, response) {
  logger.info("Showing user account page");

  let session = authController.authenticateUser(request);

  if(session) {
    
    authController.refreshSession(request, response);

    let user = await model.getUser(session.userSession.username);

    let accountInfo = {
      username: user.Username,
      email: user.Email,
      password: user.HashedPassword
    }

    response.render("account.hbs", accountInfo);
  }
}
router.get("/user", showUser);

/**
 * Redirects the user to edit their account settings.
 * @param {*} request 
 * @param {*} response 
 */
async function modifyAccountPage(request, response) {

  let session = authController.authenticateUser(request);

  if(session) {
    
    authController.refreshSession(request, response);

    let user = await model.getUser(session.userSession.username);

    let accountInfo = {
      userID: user.UserID,
      username: user.Username,
      email: user.Email
    }
    
    response.render("modifyAccount.hbs", accountInfo);
  }
  
}
router.get("/modifyaccount", modifyAccountPage);

/**
 * Handles PUT '/users/:id'
 * Calls the model to update user account settings.
 * @param {*} request
 * @param {*} response
 */
async function updateUser(request, response) {
  
  logger.info("Updating user settings");

  let session = authController.authenticateUser(request);

  if (session) {
    
    authController.refreshSession(request, response);

    let user = await model.getUser(session.userSession.username);

    const expectedPassword = user.HashedPassword;

    if (expectedPassword && (await bcrypt.compare(request.body.oldPassword, expectedPassword))) {
      
      await model.UpdateUserInformations(
        user.UserID, 
        request.body.username, 
        request.body.email,
        request.body.newPassword, 
        request.body.newPasswordRepeat, 
        request.body.oldPassword);
        
        let accountInfo = {
          username: request.body.username,
          email: request.body.email,
          password: request.body.newPassword
        }
    
        response.render("account.hbs", accountInfo);

        logger.info("Finished updating user settings");
    }
  }
}
router.put("/users/:id", updateUser);

/**
 * Handles DELETE '/users/:id'
 * Calls the model to delete a user account.
 * @param {*} request
 * @param {*} response
 */
async function deleteUser(request, response) {
  logger.info("Deleting user");

  let session = authController.authenticateUser(request);

  if (session) {
    
    let user = await model.getUser(session.userSession.username);

    await activitiesModel.deleteAllActivities(user.UserID);

    await model.DeleteUser(user.UserID);

    response.render("register.hbs");

    logger.info("Finished deleting user.");
  }
}
router.delete("/users/:id", deleteUser);

/**
 * Redirects the user to edit their account settings.
 * @param {*} request 
 * @param {*} response 
 */
 async function deleteAccountPage(request, response) {

  let session = authController.authenticateUser(request);

  if(session) {
    
    authController.refreshSession(request, response);

    let user = await model.getUser(session.userSession.username);

    let userInfo = {
      userID: user.UserID,
      username: user.Username
    }

    response.render("deleteAccount.hbs", userInfo);

    logger.info("Redirected to delete account page");
  }
}
router.get("/deleteaccount", deleteAccountPage);

module.exports = {
  router,
  routeRoot,
  showUser,
  updateUser,
  modifyAccountPage,
  deleteUser,
  deleteAccountPage
};