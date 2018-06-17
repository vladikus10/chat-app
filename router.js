const fs = require('fs');
const apiRouter = require('express').Router({mergeParams: true});
const errorHandler = require('./controllers/errors');
const react = require('./controllers/react');

module.exports = (app, routesPath) => {

    app.use('/', apiRouter);

    fs.readdirSync(routesPath).forEach((name) => {
        const route = require(`${routesPath}/${name}`);
        apiRouter.use(route.path, route.router);
    });

    apiRouter.all('/api/*', (req, res) => {
        res.status(404).send({
            message: `Route "${req.originalUrl}" does not exist`
        });
    });

    apiRouter.get('/*', react.sendApp);
    
    apiRouter.use(errorHandler);
};