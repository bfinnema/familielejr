const mongoose = require('mongoose');

var EventregSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    agegroup: {
        type: String,
        required: true
    },
    arrivalday: {
        type: String
    },
    arrivaltime: {
        type: Date
    },
    departureday: {
        type: String
    },
    departuretime: {
        type: Date
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

var Eventreg = mongoose.model('Eventreg', EventregSchema);

module.exports = {Eventreg};
