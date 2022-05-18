const activitiesModel = require('../models/activitiesModel');
const usersModel = require('../models/usersModel');
const commentsModel = require('../models/commentsModel');

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

const usersData = [
    { username: 'user1', email: 'user1@gmail.com', password: 'user1'},
    { username: 'user2', email: 'user2@gmail.com', password: 'user2'},
    { username: 'user3', email: 'user3@gmail.com', password: 'user3'},
    { username: 'user4', email: 'user4@gmail.com', password: 'user4'}

];