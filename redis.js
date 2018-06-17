const Redis = require('ioredis');
const redis = Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
});

module.exports = redis;