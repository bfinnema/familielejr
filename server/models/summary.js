var mongoose = require('mongoose');

var SummarySchema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    meetingdate: {
        type: Date,
        required: true
    },
    agenda: [
        {
            item: {type: String},
            description: {type: String},
            decision: {type: String}
        }
    ],
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    _event: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    visible: {
        type: Boolean,
        default: false
    }
});

var Summary = mongoose.model('Summary', SummarySchema);

module.exports = {Summary};