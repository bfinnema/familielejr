const mongoose = require('mongoose');

var NauserSchema = new mongoose.Schema({
  name: {
    firstname: {type: String, required: true},
    middlename: {type: String},
    surname: {type: String, required: true}
  },
  address: {
    street: {type: String},
    houseno: {type: Number},
    floor: {type: String},
    direction: {type: String},
    zip: {type: String},
    town: {type: String},
    country: {type: String}
  },
  phone: {
    type: String
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    unique: true
  },
  _tenant: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
});

var Nauser = mongoose.model('Nauser', NauserSchema);

module.exports = {Nauser}
