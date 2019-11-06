const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    date: {
        type: Date,
        default: Date.now
    },
    mainDishes: {
        type: [{
            type: String
        }],
        validate: [value => { return value.length <= 3}, 'Maximum 3 dishes']
    },
    sideDishes: {
        type: [{
            type: String
        }],
        validate: [value => { return value.length <= 5}, 'Maximum 5 dishes']
    },
    salads: {
        type: [{
            type: String
        }],
        validate: [value => { return value.length <= 3}, 'Maximum 3 dishes']
    },
    desserts: {
        type: [{
            type: String
        }],
        validate: [value => { return value.length <= 3}, 'Maximum 3 dishes']
    },
});

module.exports = Menu = mongoose.model('menu', MenuSchema);