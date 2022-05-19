// Set an expiry date as late as possible (special value for year 2038, beyond which there can be browser issues)
const expiresAt = new Date(2147483647000);
const express = require("express");
const router = express.Router();
const routeRoot = "/";
const logger = require("../logger");

function toggleDarkMode(request, response) {
  // if no theme cookie exists create one and set it to dark mode
  if (!request.cookies.theme) {
    response.cookie("theme", "dark", { expires: expiresAt });
    logger.info("No theme cookie found, setting theme to dark");
  }
  // if the theme is dark then set the theme to light
  else if (request.cookies.theme === "dark") {
    response.cookie("theme", "light");
    logger.info("Theme cookie found, setting theme to light");
  }
  // if the theme is light then set the theme to dark
  else {
    response.cookie("theme", "dark");
    logger.info("Theme cookie found, setting theme to dark");
  }
  response.redirect("/");
}

router.get("/theme", toggleDarkMode);

function IsDarkMode(request) {
  //check if the theme cookie exists
  if (request.cookies.theme) {
    //if the theme cookie exists and is dark then return true
    if (request.cookies.theme === "dark") {
      return true;
    }
  }
  //if the theme cookie does not exist or is light then return false
  return false;
}

module.exports = {
  router,
  routeRoot,
  IsDarkMode,
};
