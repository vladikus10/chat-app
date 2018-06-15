const redis = require('../redis');
const jwt = require('jsonwebtoken');
const async = require('async');
const { EXPIRATIONS } = require('../constants');
/**
 * Creates a new jwt token and saves it ot the Redis database
 * @async
 * @param {Object} user Mongoose user document
 * @returns {Promise} Promise that will return user token data
 */
module.exports.create = (user) => {
    let userData = {
        _id: user._id,
        username: user.username
    };
    return new Promise((resolve, reject) => {
        jwt.sign({
            data: userData
        }, process.env.TOKEN_SECRET, { expiresIn: EXPIRATIONS.ACCESS_TOKEN }, (error, token) => {
            if (error) return reject(error);

            userData.access_token = token;

            redis.setex(token, EXPIRATIONS.ACCESS_TOKEN, JSON.stringify(userData), (error, response) => {
                if (error) return reject(error);

                resolve(userData);
            });
        });
    });
};
/**
 * Checks if the token exists in the Redis database and verifies it using the secret
 * @param {String} token Token to be verified
 * @returns {Promise} Promise that will return user token data
 */
module.exports.verify = (token) => {
    return new Promise((resolve, reject) => {
        async.parallel([
            done => {
                redis.get(token, (error, response) => {
                    if (error) return done(error);

                    if (!response) return done(403);

                    response = JSON.parse(response);
                    done(null, response);
                });
            },
            done => {
                jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
                    if (error) return done(error);

                    done(null, decoded);
                });
            }
        ], (error, [redisResponse, decodedToken]) => {
            if (error) reject(error);

            else resolve(redisResponse);
        });
    });
};

/**
 * Updates the token data
 * @param {Object} userData User token information
 * @returns {Promise} Promise that will return updated user token data
 */
module.exports.update = (userData) => {
    return new Promise((resolve, reject) => {
        redis.setex(userData.access_token, EXPIRATIONS.ACCESS_TOKEN, JSON.stringify(userData), (error, response) => {
            if (error) reject(error);
            
            resolve(userData);
        });
    });
};

/**
 * Removes the token from the Redis database
 * @param {String} token Token to be removed. 
 */
module.exports.expire = (token) => {
    redis.del(token);
}