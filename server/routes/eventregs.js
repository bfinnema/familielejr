const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Eventreg} = require('../models/eventreg');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  var eventreg = new Eventreg({
    name: req.body.name,
    agegroup: req.body.agegroup,
    year: req.body.year,
    arrivalday: req.body.arrivalday,
    arrivaltime: req.body.arrivaltime,
    departureday: req.body.departureday,
    departuretime: req.body.departuretime,
    _creator: req.user._id,
    registeree: registeree
  });

  eventreg.save().then ((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for all years submitted by a specific member
router.get('/', authenticate, (req, res) => {
  Eventreg.find({
    _creator: req.user._id
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one year submitted by a specific member
router.get('/:year', authenticate, (req, res) => {
  var year = req.params.year;
  Eventreg.find({
    _creator: req.user._id,
    year: year
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for all years
router.get('/all', (req, res) => {
  Eventreg.find({}).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one year
router.get('/all/year/:year', (req, res) => {
  var year = req.params.year;
  Eventreg.find({year: year}).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// The creator of an event registration deletes the registration
router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Eventreg.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((eventreg) => {
    if (!eventreg) {
      return res.status(404).send();
    }

    res.json(eventreg);
  }).catch((e) => {
    res.status(400).send();
  });
});

// The admin or organizer deletes the registration
router.delete('/admin/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (req.user.role < 2) {
    Eventreg.findOneAndRemove({
      _id: id
    }).then((eventreg) => {
      if (!eventreg) {
        return res.status(404).send();
      }
  
      res.json(eventreg);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };

});

module.exports = router;
