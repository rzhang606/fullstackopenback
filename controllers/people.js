const peopleRouter = require('express').Router();
const Person = require('../models/Person');
const logger = require('../utils/logger');



/**
 * Get
 */

//get all people
peopleRouter.get('/', (req, res) => {
    //Retrieve using 'find' method of Person model, {} looks for all
    Person.find({})
        .then(person => {
            res.json(person);
        })
        .catch(err => {
            return err(500, err.message, res);
        });
});

//get person by id
peopleRouter.get('/:id', (req, res, next) => {
    Person.findById(req.params.id)
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
            console.log(`Deleted ${result.name} succesfully`);
            res.status(204).end();
        })
        .catch(err => {
            return err(500, 'Could not delete', res);
        });
});



/**
 * POST
 */
peopleRouter.post('/', (req, res, next) => {
    const body = req.body;

    const newPerson = new Person({
        name: body.name,
        number: body.number,
        date: new Date(),
    });

    newPerson.save()
        .then(savedPerson => {
            console.log(`Saved ${savedPerson.name} successfully`);
            res.json(savedPerson.toJSON());
        })
        .catch(err => next(err)); // let middleware handler this error
});



/**
 * PUT
 */
peopleRouter.put('/:id', (req, res, next) => {
    const body = req.body;
    console.log('Body: ', body);

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
            console.log(`Updated ${updatedPerson.name} successfully`);
            res.json(updatedPerson.toJSON());
        })
        .catch(err => next(err));
});



module.exports = peopleRouter;