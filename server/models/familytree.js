var mongoose = require('mongoose');

var FamilytreeSchema = new mongoose.Schema({
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
  klan: {
    type: String
  },
  description: {
    type: String
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
    type: Number
  },
  persons: [
    {
      firstname: {type: String}, middlename: {type: String}, surname: {type: String},
      birth: {type: Date}, pass: {type: Date}
    }
  ],
  secondlevel: [
    {
      _family_id: {type: Number},
      persons: [
        {
          firstname: {type: String}, middlename: {type: String}, surname: {type: String},
          birth: {type: Date}, pass: {type: Date}
        }
      ],
      thirdlevel: [
        {
          _family_id: {type: Number},
          persons: [
            {
              firstname: {type: String}, middlename: {type: String}, surname: {type: String},
              birth: {type: Date}, pass: {type: Date}
            }
          ]
        }
      ]
    }
  ]
});

var Familytree = mongoose.model('Familytree', FamilytreeSchema);

module.exports = {Familytree};