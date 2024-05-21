var mongoose = require('mongoose');

var Grocery = mongoose.model('Grocery', {
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    groceryname: {
        type: String,
        required: true
    },
    grocerytype: {
        type: String
    },
    logging: [
        {
            year: {
                type: Number,
                required: true
            },
            /* quantitypurchased: {
                type: Number,
                required: false
            }, */
            quantityconsumed: {
                type: Number,
                required: false
            }
        }
    ],
    measure: {
        type: String,
        required: false
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = {Grocery};
