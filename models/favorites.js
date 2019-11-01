const mongoose = require('mongoose');

const FavoritesSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant'
    },
});

module.exports = Favorites = mongoose.model('favorites', FavoritesSchema);