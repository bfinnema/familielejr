const mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    }
});

var Game = mongoose.model('Game', GameSchema);

module.exports = {Game};
