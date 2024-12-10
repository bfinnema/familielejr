var mongoose = require('mongoose');

var Expense = mongoose.model('Expense', {
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    year: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    vendor: {
        type: String
    },
	expensedate: {
		type: Date,
		default: Date.now
	},
    expensetype: {
        type: String
    },
    expenseprice: {
        type: Number,
        required: true
    },
	vatliable: {
		type: Boolean
	},
    expensevat: {
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

module.exports = {Expense};
