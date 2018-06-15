const Joi = require('joi');

module.exports.create = {
    body: {
        username: Joi.string().min(5).required(),
        password: Joi.string().min(5).required()
    },
    options: {
        allowUnknownBody: false
    }
};

module.exports.login = {
    body: {
        username: Joi.string().required(),
        password: Joi.string().required()
    },
    options: {
        allowUnknownBody: false
    }
};

module.exports.update = {
    body: {
        username: Joi.string().min(5).required()
    },
    options: {
        allowUnknownBody: false
    }
};