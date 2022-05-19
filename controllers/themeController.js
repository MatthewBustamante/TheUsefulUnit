// Set an expiry date as late as possible (special value for year 2038, beyond which there can be browser issues)
const expiresAt = new Date(2147483647000);
const express = require("express");
const router = express.Router();
const logger = require("../logger");

router.get("/theme", toggleDarkMode);

function toggleDarkMode(request, response) {
  // if no theme cookie exists create one and set it to dark mode
  if (!request.cookies.theme) {
    response.cookie("theme", "dark");
    logger.info("No theme cookie found, setting theme to dark");
  }
  // if the theme is dark then set the theme to light
  else if (request.cookies.theme === "dark") {
    response.cookie("theme", "light");
    logger.info("Theme cookie found, setting theme to light");
  }
  // if the theme is light then set the theme to dark
  else {
    response.cookie("theme", "dark", { expires: expiresAt });
    logger.info("Theme cookie found, setting theme to dark");
  }
}
