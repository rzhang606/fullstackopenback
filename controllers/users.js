const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/User');

/**
 * POST
 */
usersRouter.post('/', async (req, res) => {
    const body = req.body;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    });

    const savedUser = await user.save();

    res.json(savedUser);
});

/**
 * GET
 */
usersRouter.get('/', async (req, res) => {
    // ids in 'people' field of users will be populated with their corresponding Person object
    // populate uses the ref field in the definition of the model
    const users = await User.find({}).populate('people', { name: 1, number: 1 });
    res.json(users.map(u => u.toJSON()));
});

module.exports = usersRouter;