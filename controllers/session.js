const { User, RefreshToken } = require('../db').models;
const jwt = require('../helpers/jwt');
const async = require('async');
const { ERRORS } = require('../constants');

module.exports.render = (req, res, next) => {
    res.render('login');
};

module.exports.login = (req, res, next) => {
    User.findOne({ username: req.body.username })
        .select('+password')
        .exec()
        .then(user => {
            if (!user) return next(ERRORS.INVALID_USERNAME_PASSWORD);

            user.comparePassword(req.body.password).then((isMatch) => {
                if (!isMatch) return next(ERRORS.INVALID_USERNAME_PASSWORD);

                async.parallel([
                    done => {
                        jwt.create(user).then(userData => {
                            done(null, userData);
                        }, error => {
                            done(error);
                        });
                    },
                    done => {
                        RefreshToken.generateNewToken(user._id, req.headers['user-agent']).then(refreshToken => {
                            done(null, refreshToken);
                        }, error => {
                            done(error);
                        });
                    }
                ], (error, [userData, refreshToken]) => {
                    if (error) return next(error);
                    let response = userData;
                    response.refresh_token = refreshToken;
                    res.status(200).send(response);
                });
            });
        }, error => {
            next(error);
        });
};

module.exports.refresh = (req, res, next) => {
    let rToken = req.headers['x-refresh-token'];
    let aToken = req.headers['x-access-token'];
    if (!rToken || !aToken) return next(ERRORS.MISSING_TOKENS);

    let userId = rToken.split('.')[0];
    let userAgent = req.headers['user-agent'];

    RefreshToken.findOne({ user: userId, user_agent: userAgent })
        .populate('user')
        .exec()
        .then(refreshToken => {
            if (!refreshToken) return next(403);
            if (refreshToken.expires_at.getTime() < Date.now) return next(ERRORS.MISSING_TOKENS);
            refreshToken.validateToken(rToken).then(() => {
                async.parallel([
                    done => {
                        jwt.create(refreshToken.user).then(tokenData => {
                            jwt.expire(aToken);
                            done(null, tokenData);
                        }, error => {
                            done(error);
                        });
                    },
                    done => {
                        RefreshToken.generateNewToken(userId, userAgent).then(token => {
                            done(null, token);
                        }, error => {
                            done(error);
                        });
                    }
                ], (error, [tokenData, newRefreshToken]) => {
                    if (error) return next(error);
                    tokenData.refresh_token = newRefreshToken;
                    res.status(200).send(tokenData);
                });
            }, error => {
                next(error);
            });
        }, error => {
            next(error);
        });
};

module.exports.logout = (req, res, next) => {
    let rToken = req.headers['x-refresh-token'];
    let aToken = req.headers['x-access-token'];
    if (!rToken || !aToken) return next(ERRORS.MISSING_TOKENS);

    let userId = rToken.split('.')[0];
    let userAgent = req.headers['user-agent'];

    RefreshToken.findOne({ user: userId, user_agent: userAgent })
        .exec()
        .then(refreshToken => {
            if (!refreshToken) return next(403);
            refreshToken.validateToken(rToken).then(() => {
                refreshToken.remove().then(() => {
                    jwt.expire(aToken);
                    res.status(200).send('OK');
                }, error => {
                    next(error);
                });
            }, error => {
                next(error);
            });
        }, error => {
            next(error);
        });
};