const fs = require('fs');
const jwt = require('./helpers/jwt');

const redisAdapter = require('socket.io-redis');

const Redis = require('ioredis');
const pub = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
});

const sub = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
});

const { ERRORS } = require('./constants');

let events = [];
let io = null;

module.exports.setup = (server, socketsPath) => {
  io = require('socket.io')(server);

  io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));

  fs.readdirSync(socketsPath).forEach((name) => {
    require(`${socketsPath}/${name}`);
  });

  io.use((socket, next) => {
    const token = socket.handshake.query.access_token;

    if(!token) return next(ERRORS.SOCKET_MISSING_TOKEN);

    jwt.verify(token).then(userData => {
        socket.user = userData;
        socket.id = userData._id;
        next();
    }, error => {
        console.log(error);
        next(ERRORS.FORBIDDEN);
    });
  });

  io.on('connection', (socket) => {
    console.log(`Socket connection: ${socket.id}`);
    socket.authorized = false;

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}`);
    });

    socket.on('error', (error) =>{
      console.error(error);
    });
    

    for(let e of events){
      socket.on(e.event, (...args) => {
        args.unshift(socket);
        e.callback.apply(null, args);
      });
    }
  });
};

/**
 * Broadcasts a message to all sockets.
 * @param {String} event Event name.
 * @param {String|Object} message Message to broadcast.
 * @param {String} [userId] Optional user id to ignore i nthe broadcast.
 */
module.exports.broadcast = (event, message, userId = null) => {
  const socket = io.sockets.connected[userId];
  if(socket) socket.broadcast.emit(event, message);
  else io.sockets.emit(event, message);
};

/**
 * Sends a direct message to a socket.
 * @param {String} event Event name.
 * @param {String|Object} message Message to send.
 * @param {String} userId User id to send to.
 */
module.exports.directMessage = (event, message, userId) => {
  const socket = io.sockets.connected[userId];
  if(socket) socket.emit(event, message);
};

module.exports.io = () => {
  return io;
};

module.exports.on = (event, callback) => {
  events.push({event: event, callback: callback});
};
