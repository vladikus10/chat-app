const { User } = require('../db').models;
const { MESSAGES } = require('../constants');

module.exports.get = (req, res, next) => {
    const loggedInUser = res.locals.session._id;

    User.find({
        _id: {
            $ne: loggedInUser
        }
    })
        .exec()
        .then(users => {
            res.status(200).send(users);
        }, error => {   
            next(error);
        });
};

module.exports.create = (req, res, next) => {
    const userData = req.body;
    const newUser = new User(userData);

    newUser.save().then(user => {
        res.status(201).send({message: MESSAGES.USER_CREATED});
    }, error => {
        next(error);
    });
};

module.exports.update = (req, res, next) => {
    const userId = res.locals.session._id;
    const newUsername = req.body.username;

    User.findByIdAndUpdate(userId, {username: newUsername}, {new: true})
        .exec()
        .then(user => {
            res.status(200).send(user);
        }, error => {
            next(error);
        });
};

