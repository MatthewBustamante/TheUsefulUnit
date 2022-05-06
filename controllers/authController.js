const express = require('express');
const router = express.Router();
const routeRoot = '/';
const userModel = require('../models/usersModel')
const logger = require('../logger');
const uuid = require('uuid');
const errors = require('../utilities/errors')
const bcrypt = require('bcrypt');

const sessions = {}

class Session {
    constructor(username, expiresAt) {
      this.username = username
      this.expiresAt = expiresAt
    }
    // We'll use this method later to determine if the session has expired
    isExpired() {
      this.expiresAt < (new Date())
    }
}

/**
 * Handles POST '/register'
 * Securely creates a new user account.
 * @param {*} request 
 * @param {*} response 
 */
 async function createUser(request, response) {
     try {
        logger.info('Authentication controller called (create user)');

        if (request.body.username != undefined && request.body.email  != undefined && request.body.password != undefined && request.body.password2 != undefined) {
            //User gets created with logic to hash password within the model
            let user = await userModel.createUser(request.body.username, request.body.email, request.body.password, request.body.password2);

            //Render success page
            response.render('login.hbs', {message: "Successfully created user, please log in to continue"});

            logger.info("Authentication controller: Successfully created user");

            return;
        }
     } catch(error) {
        if(error instanceof errors.DatabaseConnectionError || error instanceof errors.DatabaseReadError || error instanceof errors.DatabaseWriteError){
            //Server error
            response.status(500)
        } else {
            //User error (invalid input, etc)
            response.status(400)
        }

        //Render fail page
        response.render('register.hbs', {error: error.message, status: response.statusCode});

        logger.error(error.message + " (" +  response.statusCode + ")");
     }
}

router.post('/register', createUser);

/**
 * Handles POST '/login'
 * Authenticates the user when logging in.
 * @param {*} request 
 * @param {*} response 
 */
async function login(request, response) {
    try {
        logger.info('Authentication controller called (login)');

        if (request.body.identifier != undefined && request.body.password != undefined) {
            
            //Get user by username/email from database
            let user = await userModel.getUser(request.body.identifier);

            //Get the hashed version of the password from database
            const expectedPassword = user.HashedPassword;

            //Hashes entered password then compares it to the hashed password on the database
            if (expectedPassword && await bcrypt.compare(request.body.password, expectedPassword)) {
                logger.info("Successful login for user " + username);
          
                // Create a session object that will expire in 2 minutes
                const sessionId = createSession(username, 2);
                
                // Save cookie that will expire.
                response.cookie("sessionId", sessionId, { expires: sessions[sessionId].expiresAt });

                //Render success page

                logger.info("Authentication controller: Successfully logged into user " + user.identifer);
              } else {
                throw new errors.ValidationError("Invalid username / password given for user: " + request.body.identifier);
              }
        } else {
            throw new errors.ValidationError("Identifier and password must have a value");
        }
     } catch(error) {
        if(error instanceof errors.DatabaseConnectionError || error instanceof errors.DatabaseReadError || error instanceof errors.DatabaseWriteError){
            //Server error
            response.status(500)
        } else {
            //User error (invalid input, etc)
            response.status(400)
        }

        //Render fail page

        logger.error(error.message + " (" +  response.statusCode + ")");
     }
}

router.post('/login', login);

/**
 * Handles POST '/logout'
 * Authenticates the user when logging out.
 * @param {*} request 
 * @param {*} response 
 */
async function logout(request, response) {
    logger.info('Authentication controller called (logout)');
    
    const authenticatedSession = authenticateUser(request);
    
    if (!authenticatedSession) {
        //response.sendStatus(401); // Unauthorized access
        logger.info("User is not logged in");
        response.redirect('/');
        return;
    }
  
    delete sessions[authenticatedSession.sessionId]

    logger.info("Logged out user " + authenticatedSession.userSession.username);

    response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.

    response.redirect('/');
}

router.post('/logout', logout);
  
function createSession(username, numMinutes) {
    // Generate a random UUID as the sessionId
    const sessionId = uuid.v4()

    // Set the expiry time as numMinutes (in milliseconds) after the current time
    const expiresAt = new Date(Date.now() + numMinutes * 60000);

    // Create a session object containing information about the user and expiry time
    const thisSession = new Session(username, expiresAt);

    // Add the session information to the sessions map, using sessionId as the key
    sessions[sessionId] = thisSession;

    return sessionId;
}

function authenticateUser(request) {
    // If this request doesn't have any cookies, that means it isn't authenticated. Return null.
    if (!request.cookies) {
        return null;
    }

    // We can obtain the session token from the requests cookies, which come with every request
    const sessionId = request.cookies['sessionId']

    if (!sessionId) {
        // If the cookie is not set, return null
        return null;
    }

    // We then get the session of the user from our session map
    userSession = sessions[sessionId]

    if (!userSession) {
        return null;
    }

    // If the session has expired, delete the session from our map and return null
    if (userSession.isExpired()) {
        delete sessions[sessionId];
        return null;
    }

    return {sessionId, userSession}; // Successfully validated.
}

function refreshSession(request, response) {
    const authenticatedSession = authenticateUser(request);
    
    if (!authenticatedSession) {
        response.sendStatus(401); // Unauthorized access
        return;
    }
    
    // Create and store a new Session object that will expire in 2 minutes.
    const newSessionId = createSession(authenticatedSession.userSession.username, 2);
    
    // Delete the old entry in the session map
    delete sessions[authenticatedSession.sessionId];
    
    // Set the session cookie to the new id we generated, with a
    // renewed expiration time
    response.cookie("sessionId", newSessionId, { expires: sessions[newSessionId].expiresAt })
    
    return newSessionId;
}

module.exports = {
    router,
    routeRoot,
    refreshSession,
    authenticateUser,
    sessions
}