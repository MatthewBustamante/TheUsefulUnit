const express = require("express");
const logger = require("../logger");
const model = require("../models/usersModel");
const activitiesModel = require("../models/activitiesModel");
const methodOverride = require("method-override");
const tracker = require("../utilities/tracker");
const themeController = require("../controllers/themeController");

//Used to refresh session and authenticate pages/actions
const authController = require("../controllers/authController");
const bcrypt = require("bcrypt");
const ERRORS = require("../utilities/errors");

const router = express.Router();
router.use(methodOverride("_method"));
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

    //Tracking user agent
    let ua = request.headers["user-agent"];

    //Tracking metrics
    var metrics = {
      pageVisited: "Show User Page",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "Read User",
      userAgent: ua,
    };

    const authenticatedSession = authController.authenticateUser(request);

    if (!authenticatedSession) {
      //response.sendStatus(401); //Unauthorized access
      logger.info("User is not logged in");

      metrics.user = "Guest (Not logged in)";

      tracker.updateTracker(request, response, metrics);

      let isDarkMode = themeController.IsDarkMode(request);

      response.render("login.hbs", {
        error: "You must be logged in to perform that action",
        status: 401,
        isDarkMode: isDarkMode,
      });

      return;
    }

    metrics.user = authenticatedSession.userSession.username;

    logger.info(
      "User " + authenticatedSession.userSession.username + " is logged in"
    );

    authController.refreshSession(request, response);

    let user = await model.getUser(authenticatedSession.userSession.username);

    let userInfo = {
      username: user.Username,
      email: user.Email,
    };

    let joined = await activitiesModel.getJoinedActivities(user.UserID);
    let created = await activitiesModel.getOwnedActivities(user.UserID);

    tracker.updateTracker(request, response, metrics);

    let isDarkMode = themeController.IsDarkMode(request);

    response.render("account.hbs", {
      userInfo: userInfo,
      username: authenticatedSession.userSession.username,
      activitiesJoined: joined,
      activitiesCreated: created,
      isDarkMode: isDarkMode,
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof ERRORS.ValidationError) {
      throw new ERRORS.ValidationError();
    } else if (error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError();
    } else if (error instanceof ERRORS.DatabaseWriteError) {
      throw new ERRORS.DatabaseWriteError();
    } else {
      throw new Error();
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

    //Tracking user agent
    let ua = request.headers["user-agent"];

    //Tracking metrics
    var metrics = {
      pageVisited: "Show Modify User Page",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "Read User",
      userAgent: ua,
    };

    if (session) {
      authController.refreshSession(request, response);

      let user = await model.getUser(session.userSession.username);

      metrics.user = session.userSession.username;

      let userInfo = {
        userID: user.UserID,
        username: user.Username,
        email: user.Email,
      };

      tracker.updateTracker(request, response, metrics);

      let isDarkMode = themeController.IsDarkMode(request);

      response.render("modifyAccount.hbs", {
        username: session.userSession.username,
        userInfo: userInfo,
        isDarkMode: isDarkMode,
      });
    } else {
      response.status(401);

      metrics.user = "Guest (Not logged in)";
      let isDarkMode = themeController.IsDarkMode(request);

      tracker.updateTracker(request, response, metrics);

      response.render("login.hbs", {
        error: "You must be logged in to perform that action",
        status: 401,
        isDarkMode: isDarkMode,
      });
    }
  } catch (error) {
    logger.error(error);
    if (error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError();
    } else if (error instanceof ERRORS.DatabaseReadError) {
      throw new ERRORS.DatabaseReadError();
    } else {
      throw new Error();
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

    //Tracking user agent
    let ua = request.headers["user-agent"];

    //Tracking metrics
    var metrics = {
      pageVisited: "None [User Attempted CRUD Action]",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "Update User",
      userAgent: ua,
    };

    var session = authController.authenticateUser(request);

    if (session) {
      authController.refreshSession(request, response);

      metrics.user = session.userSession.username;

      var user = await model.getUser(session.userSession.username);

      var userInfo = {
        username: user.Username,
        email: user.Email,
        userID: request.params.id,
      };

      if (!user) {
        respoonse.status(500);

        tracker.updateTracker(request, response, metrics);

        let isDarkMode = themeController.IsDarkMode(request);

        response.render("modifyAccount.hbs", {
          error: "Error updating user",
          status: 500,
          username: session.userSession.username,
          userInfo: userInfo,
          isDarkMode: isDarkMode,
        });
      }

      const expectedPassword = user.HashedPassword;

      if (
        expectedPassword &&
        (await bcrypt.compare(request.body.oldPassword, expectedPassword))
      ) {
        user = await model.UpdateUserInformations(
          user.UserID,
          request.body.username,
          request.body.email,
          request.body.newPassword,
          request.body.newPasswordRepeat,
          request.body.oldPassword
        );

        let userInfo = {
          username: request.body.username,
          email: request.body.email,
        };
        let isDarkMode = themeController.IsDarkMode(request);

        response.render("account.hbs", {
          username: session.userSession.username,
          userInfo: userInfo,
          isDarkMode: isDarkMode,
        });

        logger.info("Finished updating user settings");

        if (user) {
          userInfo = {
            username: request.body.username,
            email: request.body.email,
            userID: user.UserID,
          };

          delete authController.sessions[session.sessionId];

          response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.

          // Create a session object that will expire in 2 minutes
          const sessionId = authController.createSession(
            request.body.username,
            2
          );

          // Save cookie that will expire.
          response.cookie("sessionId", sessionId, {
            expires: authController.sessions[sessionId].expiresAt,
            secure: true,
            httpOnly: true,
          });

          //response.redirect("/user")

          tracker.updateTracker(request, response, metrics);
          let isDarkMode = themeController.IsDarkMode(request);

          response.render("account.hbs", {
            message: "Successfully updated account",
            username: userInfo.username,
            userInfo: userInfo,
            isDarkMode: isDarkMode,
          });
        } else {
          response.status(400);

          tracker.updateTracker(request, response, metrics);

          let isDarkMode = themeController.IsDarkMode(request);

          response.render("modifyAccount.hbs", {
            error: "Invalid information provided",
            status: 400,
            username: session.userSession.username,
            userInfo: userInfo,
            isDarkMode: isDarkMode,
          });
        }
      } else {
        //throw new ERRORS.ValidationError("Invalid information provided");

        response.status(400);

        tracker.updateTracker(request, response, metrics);
        let isDarkMode = themeController.IsDarkMode(request);

        response.render("modifyAccount.hbs", {
          error: "Invalid information provided",
          status: 400,
          username: session.userSession.username,
          userInfo: userInfo,
          isDarkMode: isDarkMode,
        });
      }
    } else {
      metrics.user = "Guest (Not logged in)";

      response.status(401);

      tracker.updateTracker(request, response, metrics);
      let isDarkMode = themeController.IsDarkMode(request);

      response.render("login.hbs", {
        error: "You must be logged in to perform that action",
        status: 401,
        isDarkMode: isDarkMode,
      });
    }
  } catch (error) {
    if (error instanceof ERRORS.DatabaseConnectionError) {
      response.status(500);
      response.render("error.hbs", {
        error: error.message,
        status: response.statusCode,
      });
    } else {
      response.status(400);
      response.render("error.hbs", {
        error: error.message,
        status: response.statusCode,
      });
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

    //Tracking user agent
    let ua = request.headers["user-agent"];

    //Tracking metrics
    var metrics = {
      pageVisited: "None [User Attempted CRUD Action]",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "Delete User",
      userAgent: ua,
    };

    let session = authController.authenticateUser(request);

    if (session) {
      metrics.user = session.userSession.username;

      let user = await model.getUser(session.userSession.username);

      const expectedPassword = user.HashedPassword;

      if (
        expectedPassword &&
        (await bcrypt.compare(request.body.password, expectedPassword))
      ) {
        await model.DeleteUser(user.UserID);

        delete authController.sessions[session.sessionId];

        response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.

        tracker.updateTracker(request, response, metrics);
        let isDarkMode = themeController.IsDarkMode(request);

        response.render("register.hbs", {
          message: "Successfully deleted",
          isDarkMode: isDarkMode,
        });

        logger.info("Finished deleting user.");
      } else {
        //throw new ERRORS.ValidationError("Invalid information provided");
        let user = await model.getUser(session.userSession.username);

        let userInfo = {
          userID: user.UserID,
          username: user.Username,
        };
        let isDarkMode = themeController.IsDarkMode(request);

        tracker.updateTracker(request, response, metrics);

        response.render("deleteAccount.hbs", {
          error: "Invalid password provided",
          username: session.userSession.username,
          userInfo: userInfo,
          status: 400,
          isDarkMode: isDarkMode,
        });
      }
    } else {
      response.status(401);

      metrics.user = "Guest (Not logged in)";

      tracker.updateTracker(request, response, metrics);
      let isDarkMode = themeController.IsDarkMode(request);

      response.render("login.hbs", {
        error: "You must be logged in to perform that action",
        status: 401,
        isDarkMode: isDarkMode,
      });
    }
  } catch (error) {
    logger.error(error);
    if (error instanceof ERRORS.ValidationError) {
      throw new ERRORS.ValidationError();
    } else if (error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError();
    } else if (error instanceof ERRORS.DatabaseWriteError) {
      throw new ERRORS.DatabaseWriteError();
    } else {
      throw new Error();
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

    //Tracking user agent
    let ua = request.headers["user-agent"];

    //Tracking metrics
    var metrics = {
      pageVisited: "Delete Account Page",
      visitedAt: new Date(),
      pageVisitLength: null,
      user: null,
      action: "None",
      userAgent: ua,
    };

    if (session) {
      metrics.user = session.userSession.username;

      authController.refreshSession(request, response);

      let user = await model.getUser(session.userSession.username);

      let userInfo = {
        userID: user.UserID,
        username: user.Username,
      };
      let isDarkMode = themeController.IsDarkMode(request);

      tracker.updateTracker(request, response, metrics);

      response.render("deleteAccount.hbs", {
        username: session.userSession.username,
        userInfo: userInfo,
        isDarkMode: isDarkMode,
      });

      logger.info("Redirected to delete account page");
    } else {
      metrics.user = "Guest (Not logged in)";

      response.status(401);

      tracker.updateTracker(request, response, metrics);

      let isDarkMode = themeController.IsDarkMode(request);

      response.render("login.hbs", {
        error: "You must be logged in to perform that action",
        status: 401,
        isDarkMode: isDarkMode,
      });
    }
  } catch (error) {
    logger.error(error);

    if (error instanceof ERRORS.DatabaseConnectionError) {
      throw new ERRORS.DatabaseConnectionError();
    } else if (error instanceof ERRORS.DatabaseReadError) {
      throw new ERRORS.DatabaseReadError();
    } else {
      throw new Error();
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
  deleteAccountPage,
};
