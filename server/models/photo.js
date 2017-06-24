var mongoose = require('mongoose');

var PhotoSchema = new mongoose.Schema({
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  year: {
      type: String,
      required:true
  },
  filename: {
      type: String,
      required:true
  }
});

var Photo = mongoose.model('Photo', PhotoSchema);

module.exports = {Photo};