var mongoose = require('mongoose');

var FuturecampSchema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    camp: {
        type: String,
    },
    address: {
        street: {type: String},
        houseno: {type: Number},
        zip: {type: String},
        town: {type: String}
    },
    startdate: {
        type: Date
    },
    enddate: {
        type: Date
    },
    organizers: [
        {
            name: {type: String}
        }
    ]
});

var Futurecamp = mongoose.model('Futurecamp', FuturecampSchema);

module.exports = {Futurecamp};