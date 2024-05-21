var mongoose = require('mongoose');

var FiscalYear = mongoose.model('FiscalYear', {
    year: {
        type: Number,
        required: true
    },
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    description: {
        type: String
    },
    locked: {
        type: Boolean,
        required: true
    },
    initiated: {
        type: Boolean
    },
    assetsStart: {
        type: Number
    },
    participantsFee: {
        type: Number
    },
	incomeTotal: {
        type: Number
	},
	expensesTotal: {
		type: Number
	},
	result: {
		type: Number
	},
	assetsEnd: {
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

module.exports = {FiscalYear};
