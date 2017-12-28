var mongoose = require('mongoose');

var FamilytreeSchema = new mongoose.Schema({
  _admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  klan: {
    type: String,
    required: true
  },
  tree: {
    persons: [
      {
        firstname: {type: String}, middlename: {type: String}, lastname: {type: String},
        birth: {type: Date}, pass: {type: Date}
      }
    ],
    secondlevel: [
      {
        persons: [
          {
            firstname: {type: String}, middlename: {type: String}, lastname: {type: String},
            birth: {type: Date}, pass: {type: Date}
          }
        ],
        thirdlevel: [
          {
            persons: [
              {
                firstname: {type: String}, middlename: {type: String}, lastname: {type: String},
                birth: {type: Date}, pass: {type: Date}
              }
            ]
          }
        ]
      }
    ]
  }
});

var Familytree = mongoose.model('Familytree', FamilytreeSchema);

module.exports = {Familytree};