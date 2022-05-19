// //#region Constants
// const DB_NAME = "FriendFinder_DB_Test";
// const app = require("../utilities/app");
// const supertest = require("supertest");
// const testRequest = supertest(app);
// const activitiesModel = require('../models/activitiesModel');
// const usersModel = require('../models/usersModel');
// const commentsModel = require('../models/commentsModel');
// const databases = require("../utilities/databases");
// let connection;
// //#endregion

// //#region Utility methods
// const TEST_USERs = [
//   {
//     username: "Tallib",
//     password: "Professor3$",
//     email: "teacherAtAbbott@gmail.com",
//   },
//   {
//     username: "JeffLobster",
//     password: "CheersBud43#",
//     email: "lobsta@hotmail.com",
//   },
//   {
//     username: "SimonS",
//     password: "bReakpOint69!",
//     email: "intellij@yahoo.com",
//   },
//   {
//     username: "Ziotic",
//     password: "Ziotic123@",
//     email: "webtomorowpls@mail.com",
//   },
//   {
//     username: "Reacts",
//     password: "$Re7xt123",
//     email: "awawawawawawawawawaw@live.fr",
//   },
//   {
//     username: "Rudiariius",
//     password: "Val0ran(",
//     email: "editionscec@gmail.com",
//   },
//   {
//     username: "OpGrandma",
//     password: "Important%9",
//     email: "quickQuestion@hotmail.com",
//   },
// ];
// const INAPPROPRIATE_WORDS = [
//   "fuck",
//   "acrotomophilia",
//   "shit",
//   "bitch",
//   "dick",
//   "ass",
//   "pussy",
//   "cunt",
//   "bollocks",
//   "bugger",
//   "choad",
//   "wanker",
//   "twat",
//   "penis",
//   "vagina",
//   "sodomy",
//   "2g1c",
//   "2girls1cup",
//   "anal",
//   "anilingus",
//   "anus",
//   "arse",
//   "erotic",
//   "ball",
//   "bang",
//   "naked",
//   "bbw",
//   "bdsm",
//   "beastiality",
//   "breasts",
//   "knockers",
//   "tits",
//   "cock",
//   "blowjob",
//   "bondage",
//   "boner",
//   "boob",
//   "boobs",
//   "booty",
//   "bukkake",
//   "dyke",
//   "butt",
//   "cameltoe",
//   "camgirl",
//   "slut",
//   "whore",
//   "cialis",
//   "clit",
//   "clitoris",
// ];

// let generateUser = () => {
//   const index = Math.floor(Math.random() * TEST_USERs.length);
//   return TEST_USERs.slice(index, index + 1)[0];
// };

// let generateBadWord = () => {
//   const index = Math.floor(Math.random() * INAPPROPRIATE_WORDS.length);
//   return INAPPROPRIATE_WORDS.slice(index, index + 1)[0];
// };

// let generateString = (length) => {
//   let result = "";
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   const charactersLength = characters.length;
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// };
// //#endregion

// /**
//  * Initialize a new database and table for every test
//  */
// beforeEach(async () => {
//   await databases.initialize(DB_NAME, true);
//   connection = await databases.getConnection();
// });

// /**
//  * close connection after every test
//  */
// afterEach(async () => {
//   if (connection) {
//     await connection.close();
//   }
// });

// //#region homeController endpoints
// test("GET / - Home Controller - success", async () => {
//     // hit the endpoint
//     let testResponse = await testRequest.get("/");

//     // check the status code
//     expect(testResponse.status).toBe(200);
// });
