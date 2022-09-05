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
    willattend: {
        type: Boolean,
        default: true
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
    diet: {
        type: String
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    registeree: {
        type: String,
        required: true
    },
    fee: {
        type: Number
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
