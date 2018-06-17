const io = require('../socketIO');
const { EVENTS, DEFAULTS, ERRORS } = require('../constants');
const { Message, User } = require('../db').models;

io.on(EVENTS.SEND_MESSAGE, (socket, message, response = DEFAULTS.CALLBACK) => {
    if(!message.recipient_id) return response(ERRORS.RECIPIENT_MISSING);
    if(!message.message || /^\s*$/.test(message.message)) return response(ERRORS.MESSAGE_EMPTY);

    User.findById(message.recipient_id)
        .exec()
        .then(user => {
            if(!user) return response(ERRORS.RECIPIENT_NOT_FOUND);

            const newMessage = new Message({
                message: message.message,
                to: user._id,
                from: socket.user._id
            });

            newMessage.save().then(message => {
                io.directMessage(EVENTS.NEW_MESSAGE, message, String(message.to));
                response(null, message);
            }, error => {
                console.error(error);
                response(ERRORS.INTERNAL);
            });
        }, error => {
            console.error(error);
            response(ERRORS.INTERNAL);
        });
});

io.on(EVENTS.MARK_SEEN, (socket, from, response = DEFAULTS.CALLBACK) => {
    Message.updateMany({
        from: from,
        to: socket.user._id
    }, {
        seen: true
    })
    .exec()
    .then(() => {
        response();
    }, error => {
        console.error(error);
        response(ERRORS.INTERNAL);
    })
});
