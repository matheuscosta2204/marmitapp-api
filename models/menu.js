const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    date: {
        type: Date,
        default: Date.now
    },
    items: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String
            }
        }
    ],
    moreDetails: {
        type: String
    }
});

module.exports = Menu = mongoose.model('menu', MenuSchema);