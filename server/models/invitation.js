var mongoose = require('mongoose');

var InvitationSchema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    year: {
        type: Number,
        required: true,
        unique: true
    },
    headline: {
        type: String,
        required: true
    },
    text1: {
        type: String
    },
    camp: {
        type: String,
        required: true
    },
    address: {
        street: {type: String, required: true},
        houseno: {type: Number},
        zip: {type: String},
        town: {type: String, required: true}
    },
    startdate: {
        type: Date,
        required: true
    },
    starttime: {
        type: Date
    },
    enddate: {
        type: Date,
        required: true
    },
    endtime: {
        type: Date
    },
    registration: {
        receiver: {type: String, required: true},
        email: {type: String},
        phone: {type: String},
        deadline: {type: Date, required: true}
    },
    bring: {
        type: String
    },
    payment: {
        priceModel: {type: String, required: false},
        adult: {type: Number, required: false},
        child: {type: Number, required: false},
        newpricemodel: {
            adult: [
                {
                    price: {type: Number}
                }
            ],
            child: [
                {
                    price: {type: Number}
                }
            ],
            smallchild: [
                {
                    price: {type: Number}
                }
            ]
        },
        meansofpayment: {
            mobilepay: {type: Boolean, required: true},
            bankpay: {type: Boolean, required: true},
            cash: {type: Boolean, required: true},
        },
        paymentinfo: {
            mobilepay: {type: String},
            bankaccount: {
                regno: {type: String},
                account: {type: String}
            },
            cash: {type: String}
        }
    },
    text2: {
        type: String
    },
    organizers: [
        {
            name: {type: String}
        }
    ]
});

var Invitation = mongoose.model('Invitation', InvitationSchema);

module.exports = {Invitation};