const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Eventreg} = require('../models/eventreg');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  console.log(`_event: ${req.body._event}`);
  var eventreg = new Eventreg({
    name: req.body.name,
    agegroup: req.body.agegroup,
    participantCategory: req.body.participantCategory,
    year: req.body.year,
    _tenant: req.user._tenant,
    _event: req.body._event,
    willattend: req.body.willattend,
    // arrivalday: req.body.arrivalday,
    arrivalOption: req.body.arrivalOption,
    arrivaltime: req.body.arrivaltime,
    // departureday: req.body.departureday,
    departureOption: req.body.departureOption,
    departuretime: req.body.departuretime,
    fee: req.body.fee,
    diet: req.body.diet,
    _creator: req.user._id,
    registeree: registeree
  });

  eventreg.save().then ((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Change an Eventreg. Is used for registering that a participant has paid the camp fee.
router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'agegroup', 'participantCategory', 'year', 'willattend', 'arrivalOption', 'arrivaltime', 'departureOption', 'departuretime', 'fee', 'diet', '_creator', 'registeree', 'paid']);
  // console.log(`Patching Eventreg, name: ${body.name}, Registeree: ${req.user.name.firstname}, ArrivalOption: ${body.arrivalOption}, DepartureOption: ${body.departureOption}, Paid? ${body.paid}`);

  var uploader = req.user.name.firstname;
  if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
  uploader = uploader + ' ' + req.user.name.surname;
  body.paymentRegisteredBy = uploader;
  // console.log(`paymentRegisteredBy: ${body.paymentRegisteredBy}`);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  };

  if (_.isBoolean(body.paid) && body.paid) {
    body.paidAt = new Date().getTime();
  } else {
    body.paid = false;
    body.paidAt = null;
    body.paymentRegisteredBy = null;
  }

  Eventreg.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((eventreg) => {
    if (!eventreg) {
      return res.status(404).send();
    };

    res.json(eventreg);
  }).catch((e) => {
    res.status(400).send();
  })
});

router.patch('/fee/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`Calculated fee: ${req.body.eventFee}`);

  if (!ObjectId.isValid(id)) {
      console.log(`id is not valid`);
      return res.status(404).send();
  };

  Eventreg.findOneAndUpdate({_id: id}, {$set: {'fee': req.body.eventFee}}).then((eventreg) => {
      if (!eventreg) {
          console.log(`Eventreg not found`);
          return res.status(404).send();
      };

      res.json(eventreg);
  }).catch((e) => {
      res.status(400).send();
  });
});

// Get all event registrations for all years submitted by a specific member
router.get('/', authenticate, (req, res) => {
  Eventreg.find({
    _tenant: req.user._tenant,
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
    _tenant: req.user._tenant,
    _creator: req.user._id,
    year: year
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for a specific event submitted by a specific member
router.get('/event/:id', authenticate, (req, res) => {
  var id = req.params.id;
  Eventreg.find({
    _tenant: req.user._tenant,
    _creator: req.user._id,
    _event: id
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for all years
router.get('/all', authenticate, (req, res) => {
  Eventreg.find({
    _tenant: req.user._tenant
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one year
router.get('/all/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  Eventreg.find({_tenant: req.user._tenant, year: year}).sort({willattend:-1}).then((eventregs) => {
    /* if (eventregs.length > 0) {
      console.log(`Regs #0: ${eventregs[0].name}`);
    }; */
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one event
router.get('/all/event/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
      console.log(`id is not valid`);
      return res.status(404).send();
  };

  Eventreg.find({_tenant: req.user._tenant, _event: id}).sort({willattend:-1}).then((eventregs) => {
    /* if (eventregs.length > 0) {
      console.log(`Regs #0: ${eventregs[0].name}`);
    }; */
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one year, sorted
router.get('/all/sort/year/:year/:sortDirection', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`sortDirection: ${req.params.sortDirection}`);
  var sd = 1;
  if (req.params.sortDirection == "up") {sd = -1};
  // console.log(`sd: ${sd}`);
  Eventreg.find({_tenant: req.user._tenant, year: year}).sort({name:sd}).then((eventregs) => {
    /* if (eventregs.length > 0) {
      console.log(`Regs #0: ${eventregs[0].name}`);
    }; */
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one event, sorted
router.get('/all/sort/event/:id/:sortDirection', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`Get all event registrations for one event, sorted. sortDirection: ${req.params.sortDirection}`);
  if (!ObjectId.isValid(id)) {
      console.log(`id is not valid`);
      return res.status(404).send();
  };

  var sd = 1;
  if (req.params.sortDirection == "up") {sd = -1};
  // console.log(`sd: ${sd}`);
  Eventreg.find({_tenant: req.user._tenant, _event: id}).sort({name:sd}).then((eventregs) => {
    /* if (eventregs.length > 0) {
      console.log(`Regs #0: ${eventregs[0].name}`);
    }; */
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Search registrations for one year
router.get('/all/search/year/:year/:searchText', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`searchText: ${req.params.searchText}`);
  var sd = 1;
  Eventreg.find({_tenant: req.user._tenant ,year: year, name: {"$regex":req.params.searchText}}).sort({name:sd}).then((eventregs) => {
    /* if (eventregs.length > 0) {
      console.log(`Regs #0: ${eventregs[0].name}`);
    }; */
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Search registrations for one event
router.get('/all/search/event/:id/:searchText', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`Search registrations for one event. searchText: ${req.params.searchText}`);
  if (!ObjectId.isValid(id)) {
      console.log(`id is not valid`);
      return res.status(404).send();
  };

  var sd = 1;
  Eventreg.find({_tenant: req.user._tenant ,_event: id, name: {"$regex":req.params.searchText}}).sort({name:sd}).then((eventregs) => {
    /* if (eventregs.length > 0) {
      console.log(`Regs #0: ${eventregs[0].name}`);
    }; */
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// The creator of an event registration deletes the registration
router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  };

  Eventreg.findOneAndDelete({
    _id: id,
    _creator: req.user._id
  }).then((eventreg) => {
    if (!eventreg) {
      return res.status(404).send();
    };

    res.json(eventreg);
  }).catch((e) => {
    res.status(400).send();
  });
});

// The admin or organizer deletes the registration
router.delete('/admin/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  };

  if (req.user.role < 2) {
    Eventreg.findOneAndDelete({
      _id: id
    }).then((eventreg) => {
      if (!eventreg) {
        return res.status(404).send();
      };
  
      res.json(eventreg);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };

});

module.exports = router;
