var mongoose = require('mongoose');

var AccountingYear = mongoose.model('AccountingYear', {
    year: {
        type: Number,
        required: true
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
	participantsFee: {
		type: Number
	},
	otherIncome: {
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

module.exports = {AccountingYear};
