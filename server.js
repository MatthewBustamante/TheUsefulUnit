const app = require("./utilities/app");
const port = 1339;
const DATABASES = require("./utilities/databases");

// initialize the database and listen to the port
DATABASES.initialize("FriendFinder_db", true).then(app.listen(port));
