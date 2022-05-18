const DB_NAME = "users_db_test";
const model = require("");
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
let connection;

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

/**
 * Initialize a new database and table for every test
 */
beforeEach(async () => {

});

afterEach(async () => {

});