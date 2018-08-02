var mongoose = require('mongoose');

var DocSchema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    year: {
        type: String
    },
    filename: {
        type: String,
        required: true
    },
    filetype: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    orientation: {
        type: Number
    },
    uploader: {
        type: String
    },
    description: {
        type: String
    }
});

var Doc = mongoose.model('Doc', DocSchema);

module.exports = {Doc};