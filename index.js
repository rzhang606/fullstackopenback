const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const Person = require('./models/Person');

const app = express();

app.use(express.json()); //allows us to use json function

/**
 * MiddleWare
 */

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'});
}

morgan.token('postbody', (req) => {    
        
    if(JSON.stringify(req.body) === '{}') {
        return 'No Body';
    }    

    return JSON.stringify(req.body)
});

app.use(morgan(':method :url :status - :response-time[3] ms - :postbody')); //logging by morgan
app.use(cors()); //allows cors
app.use(express.static('build')); // serve our frontend pages

//Get

app.get('/', (req, res) => {
    res.send('<h1>Hello World </h1>');
});

app.get('/api/persons', (req, res) => {
    //Retrieve using 'find' method of Person model, {} looks for all
    Person.find({}).then(person => {
        res.json(person);
    })
});

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person.toJSON());
    });
})

app.get('/info', (req, res) => {
    const size = 1;
    const time = new Date();
    res.send(
        `<div>
            <p>Phonebook has info for ${size} people</p>
            <p>${time}</p>
        </div>`
    )
});

//Delete

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
    .then(result => {
        console.log(`Deleted ${result.name} succesfully`);
        res.status(204).end();
    })
    .catch(err => {
        console.log(`Error deleting`, err);
    })
})

//Post

app.post('/api/persons', (req, res) => {
    console.log('Body: ', req.body);
    
    const body = req.body;

    if(!body) { // no content
        return res.status(400).json({
            error: 'no content'
        });
    }

    // Check for valid entry
    if(body.name === "") {
        return err(400, 'Must include name', res);
    }
    if(body.number === "") {
        return err(400, 'Must include number', res);
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        date: new Date(),
    })

    person.save()
        .then(savedPerson => {
            console.log(`Saved ${savedPerson.name} successfully`);
            res.json(savedPerson.toJSON());
        })
        .catch(err => {
            console.log(`Error occured`, err);
        })
})

//Put

app.put('/api/persons/:id', (req, res) => {
    const body = req.body;
    console.log('Body: ', body);

    // Check for valid entry
    if(!body) { // no content
        return res.status(400).json({
            error: 'no content'
        });
    }
    if(body.name === "") {
        return err(400, 'Must include name', res);
    }
    if(body.number === "") {
        return err(400, 'Must include number', res);
    }

    const updatePerson = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.id, updatePerson, {new: true})
        .then(updatedPerson => {
            console.log(`Updated ${updatedPerson.name} successfully`);
            res.json(updatedPerson.toJSON());
        })
        .catch(err => {
            console.log('Error updating: ', err);
        });
})

//helpers

const err = (code, message, res) => {
    return res.status(code).json(
        `error: ${message}`
    );
}


//End

//uses the specified middleware when no endpoint is found
app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
