const activitiesModel = require('../models/activitiesModel');
const usersModel = require('../models/usersModel');
const commentsModel = require('../models/commentsModel');
const database = require('../utilities/databases');
const { afterEach } = require("@jest/globals");
var connection;

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

const activitiesData = [
    { name: 'Basketball', description: 'Play basketball', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
    { name: 'Soccer', description: 'Play soccer', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
    { name: 'Swimming', description: 'Play swimming', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
    { name: 'Running', description: 'Run', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
    { name: 'Gym', description: 'Go to gym', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
    { name: 'Yoga', description: 'Do yoga', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
    { name: 'Dancing', description: 'Dance', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
    { name: 'Reading', description: 'Read', startTime: '2019-10-10T10:00:00', endTime: '2019-10-10T12:00:00', ownerID: 1 },
];

const commentsData = [
    { userID: 1, activityID: 1, comment: "Can't wait to attend!" },
    { userID: 2, activityID: 1, comment: "I'm going to attend!" },
    { userID: 3, activityID: 1, comment: "Not going to attend:(" },
]

let generateUser = () => {
    const index = Math.floor(Math.random() * TEST_USERs.length);
    return TEST_USERs.slice(index, index + 1)[0];
};

let generateBadWord = () => {
    const index = Math.floor(Math.random() * INAPPROPRIATE_WORDS.length);
    return INAPPROPRIATE_WORDS.slice(index, index + 1)[0];
};

let generateComment = () => {
    const index = Math.floor(Math.random() * commentsData.length);
    return commentsData.slice(index, index + 1)[0];
};

let generateActivity = () => {
    const index = Math.floor(Math.random() * activitiesData.length);
    return activitiesData.slice(index, index + 1)[0];
}

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

beforeEach(async () => {
    await database.initialize("FriendFinder_Test_DB", true);
    connection = database.getConnection();
})

afterEach(async () => {
    connection.close();
})

test('Test activitiesModel.getActivities', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user);

    //create activities
    const activities = [];
    for (let i = 0; i < 2; i++) {
        const activity = generateActivity();
        activity.ownerID = userID;
        activities.push(activity);
        await activitiesModel.createActivity(activity);
    }
    
    //get activities
    const result = await activitiesModel.getActivities(userID);
    expect(result.length).toBe(2);
    //expect(result[0].name).toBe(activities[0].name);
    //expect(result[1].name).toBe(activities[1].name);
});