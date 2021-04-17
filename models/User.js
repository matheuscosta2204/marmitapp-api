const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    favorites: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'restaurant'
        }]
    },
    date: {
        type: Date,
        default: Date.now
    },
    address: {
        type: {
            cep: {
                type: Number
            },
            street: {
                type: String
            },
            number: {
                type: Number
            },
            neighborhood: {
                type: String
            }
        }
    }
});

module.exports = User = mongoose.model('user', UserSchema);