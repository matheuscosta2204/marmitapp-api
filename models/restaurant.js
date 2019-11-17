const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    cnpj: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    zipCode: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    number: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
        
    },
    active: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Restaurant = mongoose.model('restaurant', RestaurantSchema);