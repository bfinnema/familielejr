const mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    description: {
        type: String
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
