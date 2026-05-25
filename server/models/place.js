var mongoose = require('mongoose');

var PlaceSchema = new mongoose.Schema({
    placeName: {
        type: String,
        required: true
    },
    placetypeName: {
        type: String,
        required: true
    },
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    address: {
        street: {type: String},
        houseno: {type: String},
        zip: {type: String},
        town: {type: String}
    },
    coordinates: {
        longitude: {type: Number},
        latitude: {type: Number}
    },
    website: {
        type: String
    },
    events: [
        {
            _event: {
                type: mongoose.Schema.Types.ObjectId
            },
            eventName: {
                type: String
            },
            year: {
                type: Number
            }
        }
    ],
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

var Place = mongoose.model('Place', PlaceSchema);

module.exports = {Place};