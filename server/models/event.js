var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    _eventtype: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    eventtypeName: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    venue: {
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
    ],
    invitation: {
        headline: {
            type: String
        },
        text1: {
            type: String
        },
        starttime: {
            type: Date
        },
        endtime: {
            type: Date
        },
        registration: {
            requiresRegistration: {type: Boolean},
            receiver: {type: String},
            email: {type: String},
            phone: {type: String},
            deadline: {type: Date}
        },
        bring: {
            type: String
        },
        payment: {
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
        active: {
            type: Boolean,
            required: true
        }
    },
    summaryExist: {
        type: Boolean,
        required: true
    },
    _summary: {
        type: mongoose.Schema.Types.ObjectId
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

var Event = mongoose.model('Event', EventSchema);

module.exports = {Event};