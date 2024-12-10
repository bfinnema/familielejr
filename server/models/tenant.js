var mongoose = require('mongoose');

var TenantSchema = new mongoose.Schema({
    tenantName: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    startYear: {
        type: Number,
        required: true
    },
    subscriptions: {
        events: {
            subscribe: {
                type: Boolean,
                default: false
            },
            multipleEventsPerYear: {
                type: Boolean,
                default: false
            },
            nameMainEvent: {
                type: String,
                default: "Familielejr"
            }
        },
        familyTree: {
            type: Boolean,
            default: false
        },
        photoGallery: {
            type: Boolean,
            default: false
        },
        summaries: {
            type: Boolean,
            default: false
        },
        accounting: {
            type: Boolean,
            default: false
        }
    },
    _admin: {
        type: mongoose.Schema.Types.ObjectId
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId
    }
});

var Tenant = mongoose.model('Tenant', TenantSchema);

module.exports = {Tenant};