const router = require('express').Router();
const controller = require('../controllers/messages');
const loggedIn = require('../middleware/loggedIn');

router.route('/:recipientId')
    .get(loggedIn(), controller.get)

module.exports = {
    path: '/api/messages',
    router: router
};