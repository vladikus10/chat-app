const { Message } = require('../db').models;
const { DEFAULTS } = require('../constants');

module.exports.get = (req, res, next) => {
    const userId = res.locals.session._id;
    const recipientId = req.params.recipientId;

    const offset = req.query.offset || DEFAULTS.OFFSET;
    const limit = req.query.limit || DEFAULTS.LIMIT;

    Message.findAndCountTotal({
        $or: [{
            from: userId,
            to: recipientId
        }, {
            from: recipientId,
            to: userId
        }]
    }, {}, {
        sort: { timestamp: 1 },
        limit: limit,
        skip: offset,
        lean: true
    }).then(messages => {
        res.status(200).send(messages);
    }, error => {
        next(error);
    });
};