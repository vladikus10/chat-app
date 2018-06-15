const router = require('express').Router();
const validate = require('express-validation');
const validator = require('../validators/users');
const controller = require('../controllers/users');
const duplicate = require('../middleware/duplicate');
const loggedIn = require('../middleware/loggedIn');

router.route('/')
    .get(loggedIn(), controller.get)
    .post(validate(validator.create), duplicate.username, controller.create)
    .put(loggedIn(), validate(validator.update), duplicate.username, controller.update);

module.exports = {
    path: '/api/users',
    router: router
};