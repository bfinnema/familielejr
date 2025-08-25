const mongoose = require('mongoose');

var EventregSchema = new mongoose.Schema({
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _event: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    participantCategory: {
        type: String,
        required: false
    },
    year: {
        type: Number,
        required: true
    },
    willattend: {
        type: Boolean,
        default: true
    },
    arrivalOption: {
        type: String
    },
    arrivaltime: {
        type: Date
    },
    departureOption: {
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
