var mongoose = require('mongoose');

var Income = mongoose.model('Income', {
    year: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    source: {
        type: String
    },
	incomedate: {
		type: Date,
		default: Date.now
	},
    incometype: {
        type: String
    },
    incomeamount: {
        type: Number,
        required: true
    },
	vatliable: {
		type: Boolean
	},
    incomevat: {
        type: Number
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    registeree: {
        type: String,
        required: true
    }
});

module.exports = {Income};
