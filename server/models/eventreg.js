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
    year: {
        type: Number,
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
    },
    registeree: {
        type: String,
        required: true
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Number,
      default: null
    },
    paymentRegisteredBy: {
      type: String,
      default: null
    }
});

var Eventreg = mongoose.model('Eventreg', EventregSchema);

module.exports = {Eventreg};
