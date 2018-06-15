const jwt = require('../helpers/jwt');

/**
 * Middleware to check for loggedIn users.
 * @param {Object} options Options;
 * @param {Boolean} [options.optional=false] If true, next() will be called even if the user isn ot logged in.
 */
module.exports = (options = {}) => {
    return (req, res, next) => {
        let accessToken = req.headers['x-access-token'];
        if (!accessToken && options.optional) return next();
        else if (!accessToken) return next(403);
    
        jwt.verify(accessToken).then(user => {
            res.locals.session = user;
            next();
        }, error => {
            if(options.optional) return next();
            next(403);
        });
    };
};