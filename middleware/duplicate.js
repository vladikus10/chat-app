const { User } = require('../db').models;
const { ERRORS } = require('../constants');

module.exports.username = (req, res, next) => {
    const username = req.body.username;

    User.count({username})
        .exec()
        .then(count => {
            if(count) return next(ERRORS.DUPLICATE_USERNAME);

            next();
        }, error => {
            next(error);
        });
};