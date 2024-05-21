var mongoose = require('mongoose');

var FuturecampSchema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    year: {
        type: Number,
        required: true
    },
    eventName: {
        type: String,
        required: true,
        unique: true
    },
    camp: {
        type: String
    },
    address: {
        street: {type: String},
        houseno: {type: Number},
        zip: {type: String},
        town: {type: String}
    },
    website: {
        type: String
    },
    startdate: {
        type: Date
    },
    enddate: {
        type: Date
    },
    organizers: [
        {
            orgname: {type: String}
        }
    ],
    committees: [
        {
            name: {type: String},
            description: {type: String},
            members: [
                {
                    membername: {type: String}
                }
            ]
        }
    ]
});

var Futurecamp = mongoose.model('Futurecamp', FuturecampSchema);

module.exports = {Futurecamp};