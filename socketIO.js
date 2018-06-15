const fs = require('fs');
const jwt = require('./helpers/jwt');

const redisAdapter = require('socket.io-redis');

const { ERRORS } = require('./constants');

let events = [];
let io = null;

module.exports.setup = (server, socketsPath) => {
  io = require('socket.io')(server);

  //io.adapter(redisAdapter({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));

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

module.exports.broadcast = (event, message) => {
  io.sockets.emit(event, message);
};

module.exports.directMessage = (event, message, userId) => {
  let socket = io.sockets.connected[userId];
  if(socket) socket.emit(event, message);
};

module.exports.io = () => {
  return io;
};

module.exports.on = (event, callback) => {
  events.push({event: event, callback: callback});
};
