const { User } = require('../db').models;
const { MESSAGES, EVENTS } = require('../constants');
const io = require('../socketIO');

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
        io.broadcast(EVENTS.NEW_USER, {
			_id: user._id,
			username: user.username
		});
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
            io.broadcast(EVENTS.USERNAME_UPDATED, user.toObject(), userId);
            res.status(200).send(user);
        }, error => {
            next(error);
        });
};

