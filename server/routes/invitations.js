const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Invitation} = require('../models/invitation');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  var invitation = new Invitation({
    headline: req.body.headline,
    year: req.body.year,
    text1: req.body.text1,
    camp: req.body.camp,
    address: req.body.address,
    startdate: req.body.startdate,
    starttime: req.body.starttime,
    enddate: req.body.enddate,
    endtime: req.body.endtime,
    registration: req.body.registration,
    bring: req.body.bring,
    payment: req.body.payment,
    text2: req.body.text2,
    organizers: req.body.organizers,
    _creator: req.user._id
  });

  invitation.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log('POST invitation error');
    res.status(400).send(e);
  });
});

router.get('/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  Invitation.findOne({
    year: year
  }).then((invitation) => {
    res.json(invitation);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/', authenticate, (req, res) => {
  Invitation.find({}).then((invitations) => {
    res.json(invitations);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['headline', 'year', 'text1', 'camp', 'address', 'startdate', 'starttime', 'enddate', 'endtime', 'registration', 'bring', 'payment', 'text2', 'organizers']);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  Invitation.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((invitation) => {
    if (!invitation) {
      console.log(`Invitation not found`);
      return res.status(404).send();
    }

    res.send({invitation});
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
