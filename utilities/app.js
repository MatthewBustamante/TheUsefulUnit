const express = require('express');
const app = express();
const logger = require('./logger');
const {engine} = require('express-handlebars');
const bodyParser = require('body-parser');
const pinohttp = require('pino-http');
const expressListRoutes = require('express-list-routes');

logger.info("Creating app");

// Tell the app to use handlebars templating engine.  
//   Configure the engine to use a simple .hbs extension to simplify file naming
app.engine('hbs', engine({ extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', './views');  // indicate folder for views

// Add support for forms+json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json());
app.use(express.static('public'))

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Http request logs will go to same location as main logger
const httpLogger = pinohttp({
    logger: logger
});
app.use(httpLogger);

// Make sure errorController is last!
//TODO: add the remaining controllers

const controllers = ['homeController', 'authController', 'loginController', 'userController', 'signupController', 'errorController'] 

// Register routes from all controllers 
//  (Assumes a flat directory structure and common 'routeRoot' / 'router' export)
controllers.forEach((controllerName) => {
    try {
        const controllerRoutes = require('../controllers/' + controllerName);
        app.use(controllerRoutes.routeRoot, controllerRoutes.router);
    } catch (error) {
        //fail gracefully if no routes for this controller
        logger.error(error);
    }    
})
// List out all created routes 
expressListRoutes(app, { prefix: '/' });

module.exports = app
