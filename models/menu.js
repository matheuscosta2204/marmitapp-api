const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    date: {
        type: Date,
        default: new Date
    },
    mainDishes: {
        type: [{
            description: { type: String },
            value: { type: Number }
        }],
        validate: [value => { return value.length <= 3}, 'Maximum 3 dishes']
    },
    sideDishes: {
        type: [{
            description: { type: String },
            value: { type: Number }
        }],
        validate: [value => { return value.length <= 5}, 'Maximum 5 dishes']
    },
    salads: {
        type: [{
            description: { type: String },
            value: { type: Number }
        }],
        validate: [value => { return value.length <= 3}, 'Maximum 3 dishes']
    },
    desserts: {
        type: [{
            description: { type: String },
            value: { type: Number }
        }],
        validate: [value => { return value.length <= 3}, 'Maximum 3 dishes']
    },
});

module.exports = Menu = mongoose.model('menu', MenuSchema);