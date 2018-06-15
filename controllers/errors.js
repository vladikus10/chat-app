const _ = require('lodash');
const { ERRORS } = require('../constants');
const mongooseError = require('mongoose').Error.ValidationError;
const ev = require('express-validation');

module.exports = (error, req, res, next) => {
    let status = 500;

    if(typeof error === 'string') return res.status(400).json({message: error});

    if((typeof error === 'object') && !(error instanceof Error)){
        let response = ((typeof error.message === 'string' || error.message instanceof String) ? {message: error.message} : error.message);
        return res.status(error.status).json(response);
    }
    if(error === 404){
        status = 404;
        error = new Error(ERRORS.NOT_FOUND);
        return res.status(status).json({message: error.message});
    }

    if(error === 403){
        status = 403;
        error = new Error(ERRORS.FORBIDDEN);
        return res.status(status).json({message: error.message});
    }

    if(error === 401){
        status = 401;
        error = new Error(ERRORS.UNAUTHORIZED);
        return res.status(status).json({message: error.message});
    }

    if(error instanceof mongooseError){
        status = 400;

        return res.status(status).json(error);
    }

    if (error instanceof ev.ValidationError) return res.status(error.status).json(error);

    console.error(error);
    
    res.status(status).json({message: ERRORS.INTERNAL});
};