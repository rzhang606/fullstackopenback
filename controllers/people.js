const peopleRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Person = require('../models/Person');
const User = require('../models/User');
const logger = require('../utils/logger');



const getToken = req => {
    const auth = req.get('authorization');
    if(auth && auth.toLowerCase().startsWith('bearer ')) {
        return auth.substring(7);
    }
    return null;
};



/**
 * Get
 */

//get all people
peopleRouter.get('/', (req, res) => {
    //Retrieve using 'find' method of Person model, {} looks for all
    Person
        .find({})
        .populate('user', { name: 1 })
        .then(person => {
            res.json(person);
        })
        .catch(err => {
            return logger.httpError(500, err.message, res);
        });
});

//get person by id
peopleRouter.get('/:id', (req, res, next) => {
    Person
        .findById(req.params.id)
        .populate('user', { name: 1 })
        .then(person => {
            if(person) {
                res.json(person.toJSON());
            } else {
                return logger.httpError(404, 'Not Found', res);
            }
        })
        .catch( err => next(err));
});

//get info of the People collection
peopleRouter.get('/info', (req, res) => {
    const time = new Date();
    Person.countDocuments({})
        .then(num => {
            res.send(
                `<div>
                    <p>Phonebook has info for ${num} people</p>
                    <p>${time}</p>
                </div>`
            );
        });
});



/**
 * Delete
 */

peopleRouter.delete('/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            logger.info(`Deleted ${result.name} succesfully`);
            res.status(204).end();
        })
        .catch(err => {
            return logger.httpError(500, 'Could not delete', res);
        });
});



/**
 * POST
 */
peopleRouter.post('/', async (req, res, next) => {
    const body = req.body;

    const token = getToken(req); //grab token from client req
    //checks validity of token, and decodes token
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if(!token || !decodedToken.id) {
        return logger.httpError(401, 'token missing or invalid', res);
    }

    const user = await User.findById(decodedToken.id);

    const newPerson = new Person({
        name: body.name,
        number: body.number,
        date: new Date(),
        user: user._id
    });


    newPerson.save()
        .then(async savedPerson => {
            logger.info(`Saved ${savedPerson.name} successfully`);

            //save notes in user
            user.people = user.people.concat(savedPerson._id);
            await user.save();

            res.json(savedPerson.toJSON());
        })
        .catch(err => next(err)); // let middleware handler this error
});



/**
 * PUT
 */
peopleRouter.put('/:id', (req, res, next) => {
    const body = req.body;
    logger.info('Body: ', body);

    // Check for valid entry
    if(!body.number) {
        return logger.httpError(400, 'Must include number', res);
    }

    const updatePerson = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(req.params.id, updatePerson, { new: true }) //new: true gives us the updated object instead of original (updatedPerson)
        .then(updatedPerson => {
            logger.info(`Updated ${updatedPerson.name} successfully`);
            res.json(updatedPerson.toJSON());
        })
        .catch(err => next(err));
});



module.exports = peopleRouter;