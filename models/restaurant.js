const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    local: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Restaurant = mongoose.model('restaurant', RestaurantSchema);