require('dotenv').config();
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.set('useFindAndModify', false); //deprecation warnings
mongoose.set('useCreateIndex', true);
const url = process.env.MONGODB_URI;

console.log('Connecting to ', url);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology:true })
    .then(result => {
        console.log('Conncted to MongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDb', error.message);
    });

//define a schema
//in mongoose, defines the shape of the documents in a certain collection
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});
personSchema.plugin(uniqueValidator);

//id is becomes a string instead of object using 'toJSON' fun
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Person', personSchema);