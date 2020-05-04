const express = require('express');
const morgan = require('morgan')
const app = express();

app.use(express.json());

//Middleware

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'});
}

morgan.token('postbody', (req) => {    
    console.log(req.body);
        
    if(JSON.stringify(req.body) === '{}') {
        return 'No Body';
    }    

    return JSON.stringify(req.body)
});

app.use(morgan(':method :url :status - :response-time[3] ms - :postbody'));

//Data
let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

//Get

app.get('/', (req, res) => {
    res.send('<h1>Hello World </h1>');
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const results = persons.filter(person => person.id === id);
    if (results.length === 0) {
        return res.status(404).json({
            error: 'Not Found'
        });
    }
    res.json();
})

app.get('/info', (req, res) => {
    const size = persons.length;
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
    const id = Number(req.params.id);
    persons = persons.filter(person => person.id === id);

    res.status(204).end();
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
    if(!body.name) {
        return err(400, 'Must include name', res);
    }
    if(!body.number) {
        return err(400, 'Must include number', res);
    }
    if(persons.filter(person => person.name === body.name).length !== 0) {
        return err(400, 'Name must be unique', res);
    }

    const person = {
        name: body.name,
        number: body.number,
        date: new Date(),
        id: generateId()
    };

    persons = persons.concat(person);

    res.json(person);
})

//helpers

const generateId = () => {
    return Math.floor(Math.random() * 1000);
}

const err = (code, message, res) => {
    return res.status(code).json({
        error: message
    });
}


//End

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
