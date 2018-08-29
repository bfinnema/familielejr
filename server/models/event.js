var mongoose = require('mongoose');

var EventTemplateSchema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

var EventTemplate = mongoose.model('EventTemplate', EventTemplateSchema);

module.exports = {EventTemplate};