var mongoose = require('mongoose');

var FamilySchema = new mongoose.Schema({
  _admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  _tenant: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  level: {
    type: Number,
    required: true
  },
  chain: {
    l0: {type: Number}, l1: {type: Number}, l2: {type: Number}, l3: {type: Number}, l4: {type: Number}, l5: {type: Number}
  },
  klan: {
    type: String,
    required: true
  },
  _parent_id: {
    type: Number,
    required: true
  },
  _family_id: {
    type: Number,
    required: true
  },
  _kid: {
    type: Number,
    required: true
  },
  persons: [
    {
      firstname: {type: String}, middlename: {type: String}, surname: {type: String},
      birth: {type: Date}, pass: {type: Date}
    }
  ]
});

var Family = mongoose.model('Family', FamilySchema);

module.exports = {Family};