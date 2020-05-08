const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/User');
const logger = require('../utils/logger');

loginRouter.post('/', async (req, res) => {
    const body = req.body;

    // search for user with requested username
    const user = await User.findOne({ username: body.username });

    // check password
    const passwordCorrect = user === null ? false :
        await bcrypt.compare(body.password, user.passwordHash);

    //if user is null or not null and password incorrect
    //401 unauthorized
    if(!(user && passwordCorrect)) {
        return logger.httpError(401, 'invalid username or password', res);
    }
    logger.info(`Login successful: ${user.username}`);

    //this also defines how the token will be decoded
    const userForToken = {
        username: user.username,
        id: user._id,
    };

    //generate a token that contains username and id (digitially signed form), using secret
    const token = jwt.sign(userForToken, process.env.SECRET);

    res
        .status(200)
        .send({ token, usename: user.username, name: user.name });
});

module.exports = loginRouter;