var mongoose = require('mongoose');

var EventtypeSchema = new mongoose.Schema({
    eventtypeName: {
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
    startYear: {
        type: Number,
        required: false
    },
    schedule: {
        type: String,
        required: true
    },
    charge: {
        type: Boolean
    },
    agendaOrNot: {
        type: Boolean
    },
    agenda: [
        {
            item: {type: String},
            description: {type: String}
        }
    ],
    participantCategories: [
        {
            name: {type: String},
            minAge: { type: Number },
            maxAge: { type: Number },
            priceFull: { type: Number },
            priceDay: { type: Number },
            active: { type: Boolean }
        }
    ],
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

var Eventtype = mongoose.model('Eventtype', EventtypeSchema);

module.exports = {Eventtype};