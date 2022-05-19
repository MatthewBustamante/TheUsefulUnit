const express = require("express");
const logger = require("../logger");
const model = require("../models/usersModel");
const activitiesModel = require("../models/activitiesModel");
const methodOverride = require('method-override');
const themeController = require("../controllers/themeController");

//Used to refresh session and authenticate pages/actions
const authController = require("../controllers/authController");
const bcrypt = require("bcrypt");
const ERRORS = require("../utilities/errors");

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
  try {

    logger.info("Showing user account page");

    console.log(request.body);

    const authenticatedSession = authController.authenticateUser(request);
    
    if (!authenticatedSession) {
      //response.sendStatus(401); //Unauthorized access
      logger.info("User is not logged in");
      let isDarkMode = themeController.IsDarkMode(request);
      response.status(401);
      response.render("login.hbs", {error: "You must be logged in to perform that action", status: 401, isDarkMode: isDarkMode});
        
      return;
    }

    logger.info("User " + authenticatedSession.userSession.username + " is logged in");

    authController.refreshSession(request, response);

    let user = await model.getUser(authenticatedSession.userSession.username);

    let userInfo = {
      username: user.Username,
      email: user.Email
    }
    let isDarkMode = themeController.IsDarkMode(request);
    response.status(200);
    response.render("account.hbs", {userInfo: userInfo, username: authenticatedSession.userSession.username, isDarkMode: isDarkMode});
  }
  catch (error) {
    logger.error(error);
    if(error instanceof ERRORS.ValidationError) {
      throw new ERRORS.ValidationError;
    }
    else if(error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError;
    }
    else if (error instanceof ERRORS.DatabaseWriteError) {
      throw new ERRORS.DatabaseWriteError;
    }
    else {
      throw new Error;
    }
  }
}
router.get("/user", showUser);

/**
 * Redirects the user to edit their account settings.
 * @param {*} request 
 * @param {*} response 
 */
async function modifyAccountPage(request, response) {
  try {

    let session = authController.authenticateUser(request);

    if(session) {
    
      authController.refreshSession(request, response);

      let user = await model.getUser(session.userSession.username);

      let userInfo = {
        userID: user.UserID,
        username: user.Username,
        email: user.Email
      }
    
      let isDarkMode = themeController.IsDarkMode(request);
      response.render("modifyAccount.hbs", {username: session.userSession.username, userInfo: userInfo, isDarkMode: isDarkMode});
      //response.render("modifyAccount.hbs", accountInfo);
    }
    else {
      let isDarkMode = themeController.IsDarkMode(request);

      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401, isDarkMode: isDarkMode});
    }
  }
  catch (error) {
    logger.error(error);
    if(error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError;
    }
    else if (error instanceof ERRORS.DatabaseReadError) {
      throw new ERRORS.DatabaseReadError;
    }
    else {
      throw new Error;
    }
  }
}
router.get("/user/modify", modifyAccountPage);

/**
 * Handles PUT '/users/:id'
 * Calls the model to update user account settings.
 * @param {*} request
 * @param {*} response
 */
async function updateUser(request, response) {
  try {
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
        
        let userInfo = {
          username: request.body.username,
          email: request.body.email
        }
        let isDarkMode = themeController.IsDarkMode(request);
    
        //response.render("account.hbs", accountInfo);
        response.render("account.hbs", {username: session.userSession.username, userInfo: userInfo, isDarkMode: isDarkMode});

        logger.info("Finished updating user settings");
      }
      else {
        throw new ERRORS.ValidationError("Invalid information provided");
      }
    }
    else {
      let isDarkMode = themeController.IsDarkMode(request);

      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401, isDarkMode: isDarkMode});
    }
  }
  catch (error) {
    logger.error(error);
    if (error instanceof ERRORS.ValidationError) {
      throw new ERRORS.ValidationError;
    }
    else if (error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError;
    }
    else if (error instanceof ERRORS.DatabaseWriteError) {
      throw new ERRORS.DatabaseWriteError;
    }
    else {
      throw new Error;
    }
  }
}
router.put("/user/:id", updateUser);

/**
 * Handles DELETE '/users/:id'
 * Calls the model to delete a user account.
 * @param {*} request
 * @param {*} response
 */
async function deleteUser(request, response) {
  try {
    logger.info("Deleting user");

    let session = authController.authenticateUser(request);

    if (session) {
    
      let user = await model.getUser(session.userSession.username);

      const expectedPassword = user.HashedPassword;

      if (expectedPassword && (await bcrypt.compare(request.body.password, expectedPassword))) {
        await activitiesModel.deleteAllActivities(user.UserID);

        await model.DeleteUser(user.UserID);

        delete authController.sessions[session.sessionId];

        response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.
      let isDarkMode = themeController.IsDarkMode(request);
        
        response.render("register.hbs", {message: "Successfully deleted", isDarkMode: isDarkMode});

        logger.info("Finished deleting user.");
      }
      else {
        //throw new ERRORS.ValidationError("Invalid information provided");
        let user = await model.getUser(session.userSession.username);

        let userInfo = {
          userID: user.UserID,
          username: user.Username
        }
        let isDarkMode = themeController.IsDarkMode(request);

        response.render('deleteAccount.hbs', 
        {error: "Invalid password provided", username: session.userSession.username, userInfo: userInfo, status: 400, isDarkMode: isDarkMode});
      }
    }
    else {
      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401});
    }
  }
  catch (error) {
    logger.error(error);
    if(error instanceof ERRORS.ValidationError) {
      throw new ERRORS.ValidationError;
    }
    else if(error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError;
    }
    else if (error instanceof ERRORS.DatabaseWriteError) {
      throw new ERRORS.DatabaseWriteError;
    }
    else {
      throw new Error;
    }
  }
}
router.delete("/user/:id", deleteUser);

/**
 * Redirects the user to edit their account settings.
 * @param {*} request 
 * @param {*} response 
 */
 async function deleteAccountPage(request, response) {
   try {
    let session = authController.authenticateUser(request);

    if(session) {
    
      authController.refreshSession(request, response);

      let user = await model.getUser(session.userSession.username);

      let userInfo = {
        userID: user.UserID,
        username: user.Username
      }
      let isDarkMode = themeController.IsDarkMode(request);

      response.render("deleteAccount.hbs", {username: session.userSession.username, userInfo: userInfo, isDarkMode: isDarkMode});

      logger.info("Redirected to delete account page");
    }
    else {
      let isDarkMode = themeController.IsDarkMode(request);

      response.render('login.hbs', {error: "You must be logged in to perform that action", status: 401, isDarkMode: isDarkMode});
    }
   }
   catch (error) {
     logger.error(error);

    if(error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError;
    }
    else if (error instanceof ERRORS.DatabaseReadError) {
      throw new ERRORS.DatabaseReadError;
    }
    else {
      throw new Error;
    }
   }
}
router.get("/user/delete", deleteAccountPage);

module.exports = {
  router,
  routeRoot,
  showUser,
  updateUser,
  modifyAccountPage,
  deleteUser,
  deleteAccountPage
};