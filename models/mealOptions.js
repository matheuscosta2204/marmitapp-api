const mongoose = require('mongoose');

const MealOptionsSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    options: {
        type: [{
            title: { type: String },
            description: { type: String },
            price: { type: Number },
            main: { type: Object },
            side: { type: Object },
            salads: { type: Object },
            deserts: { type: Object }
        }],
        validate: [value => { return value.length <= 5}, 'Maximum 5 options']
    },
});

module.exports = MealOptions = mongoose.model('mealOptions', MealOptionsSchema);