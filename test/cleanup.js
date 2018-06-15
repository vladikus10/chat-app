const path = require('path');
const root = require('app-root-path').path;
const async = require('async');
require('dotenv').config();
require('../db').setup(path.join(root, '/models'));
const models = require('../db').models;

global.url = 'http://localhost:3000';

before(function(next){
    let asyncJobs = [];

    for(let modelName in models){
        asyncJobs.push(done => {
            const model = models[modelName];

            console.log(`Clearing ${modelName} model.`)

            model.remove()
                .exec()
                .then(n => {
                    done();   
                }, error => {
                    done(error);
                });
        });
    }
    
    async.parallel(asyncJobs, error => {

        if(error) return next(error);
        next();
    });
});