var mongoose = require('mongoose');

var PhotoSchema = new mongoose.Schema({
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filetype: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  orientation: {
    type: Number
  },
  uploader: {
    type: String
  },
  imagetext: [
    {
      textobj: {
        date: {
          type: Date
        },
        contributor: {
          type: String
        },
        text: {
          type: String
        }
      }
    }
  ]
});

var Photo = mongoose.model('Photo', PhotoSchema);

module.exports = {Photo};