//Import modules
const express = require('express');
const http = require('http');
const url = require('url');
const path = require('path');
const bodyParser = require('body-parser');
//const cors = require('cors');
const cluster = require('cluster');
const numberOfCores = require('os').cpus().length;
//Set appRoot as a global
global.appRoot = path.resolve(__dirname); //APP ROOT

require('dotenv').config();


if(cluster.isMaster) {
    for(let i = 0; i < 1; i++){
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
}

else {
    //Setup database
    require('./db').setup(path.join(__dirname, 'models'));
    
    const pug = require('pug');
    //Creating an express app
    const app = express();
    const server = http.createServer(app);

    //Add app dependecies
    app.use(express.static(path.join(__dirname, '/public')));
    //app.use(cors());
    app.use(bodyParser.json());

    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, '/views'));

    //Start socket server and route the controllers
    require('./socketIO').setup(server, path.join(__dirname, 'sockets'));
    require('./router')(app, path.join(__dirname, 'routes'));

    //Server listen
    server.listen(process.env.PORT, () => {
        console.log('Server is listening on *: ', process.env.PORT);
    });
}
