const router = require('express').Router();
const controller = require('../controllers/index');
const loggedIn = require('../middleware/loggedIn');

router.route('/')
    .get(controller.renderLogin);

router.route('/chat')
    .get(controller.renderChat);

module.exports = {
    path: '/',
    router: router
};