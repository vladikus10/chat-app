const DateJs = require('date.js');

const EXPIRATIONS = {
    ACCESS_TOKEN: '15 minutes',
    REFRESH_TOKEN: '1 week'
};

for(let exp in EXPIRATIONS){
    let expiresIn = new DateJs(EXPIRATIONS[exp]).getTime() - Date.now();
    
    if(exp === 'ACCESS_TOKEN') expiresIn = Math.floor(expiresIn/1000); //Access token must be in seconds seconds

    EXPIRATIONS[exp] = expiresIn;
}

const SALT_ROUNDS = 10;

const ERRORS = {
    NOT_FOUND: 'Entry was not found.',
    FORBIDDEN: 'You are not logged in or the access token has expired',
    UNAUTHORIZED: 'You are not allowd to view this entry',

    INVALID_USERNAME_PASSWORD: 'The username or password is invalid',
    DUPLICATE_USERNAME: 'Inputted username already exists',
    MISSING_TOKENS: 'The refresh or access tokens are missing',
    REFRESH_TOKEN_EXPIRED: 'The refresh token has expired',

    RECIPIENT_MISSING: 'Recipient is missing in the message object',
    RECIPIENT_NOT_FOUND: 'Recipient with the provided id was not found',
    MESSAGE_EMPTY: 'Message cannot be empty',
    SOCKET_MISSING_TOKEN: 'Token was missing on socket handshake',

    INTERNAL: 'An internal error occured'
};

const MESSAGES = {
    USER_CREATED: 'User successfully created, you can login now'
};

const DEFAULTS = {
    OFFSET: 0,
    LIMIT: 20,
    CALLBACK: () => {return;}
};

const EVENTS = {
    SEND_MESSAGE: 'send_message',
    NEW_MESSAGE: 'new_message',
    MARK_SEEN: 'mark_seen'
};

module.exports = {
    EXPIRATIONS,
    SALT_ROUNDS,
    ERRORS,
    MESSAGES,
    DEFAULTS,
    EVENTS
};