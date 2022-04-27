const app = require("./utilities/app");
const port = 1339;
const model = require("./models/usersModel");

// initialize the database and listen to the port
model.initialize("users_db", false).then(app.listen(port));
