const app = require("./utilities/app");
const port = 1339;
const DATABASES = require("./utilities/databases");

// initialize the database and listen to the port
DATABASES.initialize("FriendFinder_DB", false).then(app.listen(port)).catch((error) => { console.log("Cannot connect to database, quitting...") });
