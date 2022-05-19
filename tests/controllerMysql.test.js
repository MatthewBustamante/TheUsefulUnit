//#region Constants
const DB_NAME = "FriendFinder_Test_DB";
const app = require("../utilities/app");
const supertest = require("supertest");
let testRequest;
const activitiesModel = require('../models/activitiesModel');
const usersModel = require('../models/usersModel');
const commentsModel = require('../models/commentsModel');
const databases = require("../utilities/databases");
let connection;
//#endregion

//#region Utility methods
const TEST_USERs = [
  {
    username: "Tallib",
    password: "Professor3$",
    email: "teacherAtAbbott@gmail.com",
  },
  {
    username: "JeffLobster",
    password: "CheersBud43#",
    email: "lobsta@hotmail.com",
  },
  {
    username: "SimonS",
    password: "bReakpOint69!",
    email: "intellij@yahoo.com",
  },
  {
    username: "Ziotic",
    password: "Ziotic123@",
    email: "webtomorowpls@mail.com",
  },
  {
    username: "Reacts",
    password: "$Re7xt123",
    email: "awawawawawawawawawaw@live.fr",
  },
  {
    username: "Rudiariius",
    password: "Val0ran(",
    email: "editionscec@gmail.com",
  },
  {
    username: "OpGrandma",
    password: "Important%9",
    email: "quickQuestion@hotmail.com",
  },
];
const INAPPROPRIATE_WORDS = [
  "fuck",
  "acrotomophilia",
  "shit",
  "bitch",
  "dick",
  "ass",
  "pussy",
  "cunt",
  "bollocks",
  "bugger",
  "choad",
  "wanker",
  "twat",
  "penis",
  "vagina",
  "sodomy",
  "2g1c",
  "2girls1cup",
  "anal",
  "anilingus",
  "anus",
  "arse",
  "erotic",
  "ball",
  "bang",
  "naked",
  "bbw",
  "bdsm",
  "beastiality",
  "breasts",
  "knockers",
  "tits",
  "cock",
  "blowjob",
  "bondage",
  "boner",
  "boob",
  "boobs",
  "booty",
  "bukkake",
  "dyke",
  "butt",
  "cameltoe",
  "camgirl",
  "slut",
  "whore",
  "cialis",
  "clit",
  "clitoris",
];

let generateUser = () => {
  const index = Math.floor(Math.random() * TEST_USERs.length);
  return TEST_USERs.slice(index, index + 1)[0];
};

let generateBadWord = () => {
  const index = Math.floor(Math.random() * INAPPROPRIATE_WORDS.length);
  return INAPPROPRIATE_WORDS.slice(index, index + 1)[0];
};

let generateString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
//#endregion

/**
 * Initialize a new database and table for every test
 */
beforeEach(async () => {
    await databases.initialize("FriendFinder_Test_DB", true);
    connection = databases.getConnection();
    testRequest = supertest.agent(app);
});

/**
 * close connection after every test
 */
afterEach(async () => {
  if (connection) {
    await connection.close();
  }
});

//#region homeController endpoints
test("GET / - Home Controller - success", async () => {
    // hit the endpoint
    let testResponse = await testRequest.get("/");

    // check the status code
    expect(testResponse.status).toBe(200);
});

test("GET /about - About Controller - success", async () => {

  let testResponse = await testRequest.get("/about");

  expect(testResponse.status).toBe(200);
});

test("GET /login - Login Controller - success", async () => {

  let testResponse = await testRequest.get("/login");

  expect(testResponse.status).toBe(200);
});

test("GET /register - Signup Controller - success", async () => {

  let testResponse = await testRequest.get("/register");

  expect(testResponse.status).toBe(200);
});

test("POST /register - Authentication Controller - success", async () => {

  const user = generateUser();
  
  // register the user
  let testResponse = await testRequest.post("/register").send({
    username: user.username,
    email: user.email,
    password: user.password,
    password2: user.password
  });

  expect(testResponse.status).toBe(200);

  // login to account
  testResponse = await testRequest.post("/login").send({
    identifier: user.username,
    password: user.password
  });

  // redirection to logged in view
  expect(testResponse.status).toBe(302);

  // go to user-exclusive page
  testResponse = await testRequest.get("/activities");

  expect(testResponse.status).toBe(200);
});

test("POST /register - Authentication Controller - failure", async () => {
  const user = generateUser();
  await usersModel.createUser(user.username, user.email, user.password, user.password);

  // user already exists
  let testResponse = await testRequest.post("/register").send({
    username: user.username,
    email: user.email,
    password: user.password,
    password2: user.password
  });

  expect(testResponse.status).toBe(400);
});

test("POST /login - Authentication Controller - success", async () => {

  const user = generateUser();
  await usersModel.createUser(user.username, user.email, user.password, user.password);

  // login to account
  let testResponse = await testRequest.post("/login").send({
    identifier: user.username,
    password: user.password
  });

  // redirect to logged in view
  expect(testResponse.text).toContain("Found. Redirecting to /home");
});

test("POST /login - Authentication Controller - failure", async () => {

  const user = generateUser();
  await usersModel.createUser(user.username, user.email, user.password, user.password);

  // login attempt with incorrect password
  let testResponse = await testRequest.post("/login").send({
    identifier: user.username,
    password: "blah blah blah"
  });

  expect(testResponse.status).toBe(400);
});

test("GET /logout - Authentication Controller - success", async () => {

  const user = generateUser();
  await usersModel.createUser(user.username, user.email, user.password, user.password);

  // login to account
  await testRequest.post("/login").send({
    identifier: user.username,
    password: user.password
  });

  // log out
  let testResponse = await testRequest.get("/logout");

  // redirect to home page
  expect(testResponse.headers.location).toBe("/");
});

test("GET /user - User Controller - success", async () => {

  const user = generateUser();
  const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

  // login to account
  let testResponse = await testRequest.post("/login").send({
    identifier: user.username,
    password: user.password
  });

  // access user-exclusive page
  let testResponse2 = await testRequest.get("/user");

  expect(testResponse2.status).toBe(200);
});

test("GET /user - User Controller - failure", async () => {

  // access user-exclusive page without logging in
  let testResponse = await testRequest.get("/user");

  // redirect to home page with error message
  expect(testResponse.status).toBe(401);
});

test("GET /user/modify - User Controller - success", async () => {

  const user = generateUser();
  await usersModel.createUser(user.username, user.email, user.password, user.password);

  // login to account
  await testRequest.post("/login").send({
    identifier: user.username,
    password: user.password
  })

  // access user-exclusive page
  let testResponse = await testRequest.get("/user/modify");

  // redirect to home page with error message
  expect(testResponse.text).toContain("You must be logged in");
});

test("GET /user/modify - User Controller - failure", async () => {

  // access user-exclusive page without logging in
  let testResponse = await testRequest.get("/user/modify");

  // redirect to home page with error message
  expect(testResponse.text).toContain("You must be logged in");
});