const router = require('express').Router();
const validate = require('express-validation');
const validator = require('../validators/users');
const controller = require('../controllers/session');
const loggedIn = require('../middleware/loggedIn');

router.route('/')
    .post(validate(validator.login), controller.login)
    .put(loggedIn(), controller.refresh)
    .delete(loggedIn(), controller.logout)

module.exports = {
    path: '/api/session',
    router: router
};