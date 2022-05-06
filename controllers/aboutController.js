const express = require("express");
const router = express.Router();
const routeRoot = "/";
const logger = require("../logger");

/**
 * Handles GET '/about'
 * Redirects the user to an about page.
 */
function showAbout(request, response) {
  logger.info("Showing About page");

  response.render("about.hbs");
}

router.get("/about", showAbout);

module.exports = {
  router,
  routeRoot,
  showAbout,
};
