const logger = require('./logger');
const morgan = require('morgan');

const requestLogger = () => {
    //Custom Morgan Tokens
    morgan.token('postbody', (req) => {
        if(JSON.stringify(req.body) === '{}') {
            return 'No Body';
        }
        return JSON.stringify(req.body);
    });
    return morgan(':method :url :status - :response-time[3] ms - :postbody');
};

// Used at the end of checking for endpoints to catch any undefined endpoints client is trying to access
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

//express error handler
const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if(error.name === 'CastError') { //invalid object id for Mongo
        return logger.httpError(400, 'malformatted id', res);
    } else if(error.name === 'ValidationError') {
        return logger.httpError(400, error.message, res);
    }

    next(error); //passes error forward to default express error handler
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
};
