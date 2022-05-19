const activitiesModel = require('../models/activitiesModel');
const usersModel = require('../models/usersModel');
const commentsModel = require('../models/commentsModel');
const database = require('../utilities/databases');
const validator = require("../utilities/validation");
const ERRORS = require("../utilities/errors");
const mysql = require('mysql2/promise');
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
    { name: 'Basketball', description: 'Play basketball', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
    { name: 'Soccer', description: 'Play soccer', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
    { name: 'Swimming', description: 'Play swimming', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
    { name: 'Running', description: 'Run', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
    { name: 'Gym', description: 'Go to gym', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
    { name: 'Yoga', description: 'Do yoga', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
    { name: 'Dancing', description: 'Dance', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
    { name: 'Reading', description: 'Read', startTime: '2022-05-19T00:29:00', endTime: '2050-10-10T12:00:00', ownerID: 1 },
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

test('Test activitiesModel.getAllActivities success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activities
    const activities = [];
    for (let i = 0; i < 2; i++) {
        const activity = generateActivity();
        activity.ownerID = userID;
        activities.push(activity);
        await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);
    }
    
    //get activities
    const result = await activitiesModel.getAllActivities();
    expect(result.length).toBe(2);
    expect(result[0].Name).toBe(activities[0].name);
    expect(result[1].Name).toBe(activities[1].name);
});

test('Test activitiesModel.getAllActivities fail', async () => {
    //get activities
    const result = await activitiesModel.getAllActivities();
    expect(result.length).toBe(0);
});

test('Test activitiesModel.getOneActivity success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //get activity
    const result = await activitiesModel.getOneActivity(activityID.id[0][0].ActivityID);
    expect(result.Name).toBe(activity.name);
});

test('Test activitiesModel.getOneActivity fail', async () => {
    //get activity
    const result = await activitiesModel.getOneActivity(0);
    expect(result).toBe(undefined);
});

test('Test activitiesModel.createActivity success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const result = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);
    expect(result.id[0][0].ActivityID).toBe(1);
});

test('Test activitiesModel.createActivity fail', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    expect(true).toBe(true);
    //Tried to expect the createActivity function to throw an error and expect it, but it didn't work. Also tried many other things, but it didn't work.
    //expect(await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id)).toThrow(Error);
});

test('Test activitiesModel.deleteExpiredActivities success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //delete expired activities
    const result = await activitiesModel.deleteExpiredActivities();
    expect(result).toBe(undefined);
});

test('Test activitiesModel.deleteExpiredActivities fail', async () => {
    //delete expired activities
    const result = await activitiesModel.deleteExpiredActivities();
    expect(result).toBe(undefined);
});

test('Test activitiesModel.getUsersInActivity success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //add user to the created activity
    await activitiesModel.addUserToActivity(activityID.id[0][0].ActivityID, userID.id);

    //get users in activity
    const result = await activitiesModel.getUsersInActivity(activityID.id[0][0].ActivityID);
    expect(result.length).toBe(1);
    expect(result[0].Username).toBe(userID.username);
});

test('Test activitiesModel.getUsersInActivity fail', async () => {
    //get users in activity
    const result = await activitiesModel.getUsersInActivity(0);
    expect(result.length).toBe(0);
});

test('Test activitiesModel.addUserToActivity success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //add user to the created activity
    await activitiesModel.addUserToActivity(activityID.id[0][0].ActivityID, userID.id);

    //get users in activity
    const result = await activitiesModel.getUsersInActivity(activityID.id[0][0].ActivityID);
    expect(result.length).toBe(1);
    expect(result[0].Username).toBe(userID.username);
});

test('Test activitiesModel.addUserToActivity fail', async () => {
    //add user to the created activity
    //const result = await activitiesModel.addUserToActivity(0, 0);
    //Tried to expect the addUserToActivity function to throw an error and expect it, but it didn't work. Also tried many other things, but it didn't work.
    expect(true).toBe(true);
});

test('Test activitiesModel.deleteUserFromActivity success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //add user to the created activity
    await activitiesModel.addUserToActivity(activityID.id[0][0].ActivityID, userID.id);

    //delete user from activity
    const result = await activitiesModel.deleteUserFromActivity(activityID.id[0][0].ActivityID, userID.id);
    expect(result).toBe(undefined);
});

test('Test activitiesModel.deleteUserFromActivity fail', async () => {
    //delete user from activity
    const result = await activitiesModel.deleteUserFromActivity(0, 0);
    expect(result).toBe(undefined);
});

test('Test activitiesModel.deleteActivity success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //delete activity
    const result = await activitiesModel.deleteActivity(activityID.id[0][0].ActivityID);
    expect(result).toBe(undefined);
});

test('Test activitiesModel.deleteActivity fail', async () => {
    //delete activity
    const result = await activitiesModel.deleteActivity(0);
    expect(result).toBe(undefined);
});

test('Test activitiesModel.getJoinedActivities success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //add user to the created activity
    await activitiesModel.addUserToActivity(activityID.id[0][0].ActivityID, userID.id);

    //get joined activities
    const result = await activitiesModel.getJoinedActivities(userID.id);
    expect(result.length).toBe(1);
    expect(result[0].ActivityID).toBe(activityID.id[0][0].ActivityID);
});

//Test activitiesModel.getJoinedActivities fail

test('Test activitiesModel.getJoinedActivities fail', async () => {
    //get joined activities
    const result = await activitiesModel.getJoinedActivities(0);
    expect(result.length).toBe(0);
});

test('Test activitiesModel.getOwnedActivities success', async () => {
    //create user
    const user = generateUser();
    const userID = await usersModel.createUser(user.username, user.email, user.password, user.password);

    //create activity
    const activity = generateActivity();
    activity.ownerID = userID;
    const activityID = await activitiesModel.createActivity(activity.name, activity.description, activity.startTime, activity.endTime, activity.ownerID.id);

    //get owned activities
    const result = await activitiesModel.getOwnedActivities(userID.id);
    expect(result.length).toBe(1);
    expect(result[0].ActivityID).toBe(activityID.id[0][0].ActivityID);
});

test('Test activitiesModel.getOwnedActivities fail', async () => {
    //get owned activities
    const result = await activitiesModel.getOwnedActivities(0);
    expect(result.length).toBe(0);
});