const config = require('./utils/config');
const express = require('express');
const cors = require('cors');
const peopleRouter = require('./controllers/people');
const usersRouter = require('./controllers/users');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

const app = express();

logger.info('Connecting to ', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology:true })
    .then(() => {
        logger.info('Conncted to MongoDB');
    })
    .catch((error) => {
        logger.error('Error connecting to MongoDb - ', error.message);
    });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

app.use(middleware.requestLogger());

app.use('/api/persons', peopleRouter);
app.use('/api/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);


module.exports = app;