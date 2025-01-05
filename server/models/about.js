var mongoose = require('mongoose');

var AboutSchema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId
    },
    _tenant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    communityName: {
        type: String,
        required: false
    },
    subHeading: {
        type: String,
        required: false
    },
    nextHeadline: {
        type: String
    },
    upcomingHeadline: {
        type: String
    },
    metadata: {
        type: String
    },
    _photo: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    textHeadlines: [
        {
            h3: {type: String},
            paragraphs: [
                {
                    paragraph: {type: String}
                }
            ]
        }
    ]
});

var About = mongoose.model('About', AboutSchema);

module.exports = {About};