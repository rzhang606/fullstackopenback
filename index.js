const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const Person = require('./models/Person');

const app = express();

/**
 * MiddleWare
 */

// Used at the end of checking for endpoints to catch any undefined endpoints client is trying to access
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

//Define the body token
morgan.token('postbody', (req) => {
    if(JSON.stringify(req.body) === '{}') {
        return 'No Body';
    }
    return JSON.stringify(req.body);
});

//express error handler
const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if(error.name === 'CastError') { //invalid object id for Mongo
        return err(400, 'malformatted id', res);
    } else if(error.name === 'ValidationError') {
        return err(400, error.message, res);
    }

    next(error); //passes error forward to default express error handler
};


app.use(express.static('build')); // serve our frontend pages
app.use(express.json()); //allows us to use json function
app.use(morgan(':method :url :status - :response-time[3] ms - :postbody')); //logging by morgan
app.use(cors()); //allows cors


/**
 * Get
 */

//get all people
app.get('/api/persons', (req, res) => {
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
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if(person) {
                res.json(person.toJSON());
            } else {
                return err(404, 'Not Found', res);
            }
        })
        .catch( err => next(err));
});

//get info of the People collection
app.get('/info', (req, res) => {
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

app.delete('/api/persons/:id', (req, res) => {
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
 * Post
 */

app.post('/api/persons', (req, res, next) => {
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

//Put

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body;
    console.log('Body: ', body);

    // Check for valid entry
    if(!body.number) {
        return err(400, 'Must include number', res);
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

//helpers

const err = (code, message, res) => {
    console.log(`Error code ${code}: `, message);
    return res.status(code).json(
        `error: ${message}`
    );
};


//End

// Middleware to be loaded last
app.use(unknownEndpoint); // no endpoint
app.use(errorHandler);  // err handling

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
