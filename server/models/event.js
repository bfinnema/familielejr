var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

var Event = mongoose.model('Event', EventSchema);

module.exports = {Event};