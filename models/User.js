const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    name: String,
    passwordHash: String,
    people: [ //store people as array of mongo ids+
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Person'
        }
    ],
});
userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHash;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;