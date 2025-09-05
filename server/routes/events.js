const {ObjectId} = require('mongodb');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

var {Event} = require('../models/event');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  // console.log(`Firstname: ${req.user.name.firstname}`);
  // console.log(`_tenant: ${req.user._tenant}`);
  var body = _.pick(req.body, [
    'eventName',
    '_eventtype',
    'eventtypeName',
    'year',
    'description',
    'venue',
    'address',
    'website',
    'startdate',
    'enddate',
    'organizers',
    'committees',
    'invitation',
    'summaryExist'
  ]);
  body._creator = req.user._id;
  body._tenant = req.user._tenant;
  var event = new Event(body);

  event.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log(`Error code in POST Event: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  });
});

router.get('/', authenticate, (req, res) => {
  Event.find({
    _tenant: req.user._tenant
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/tenant/:_tenant_id', authenticate, (req, res) => {
  // console.log('This is the find by TENANT section in events');
  var id =req.params._tenant_id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  };

  Event.find({
    _tenant: id
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/future/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log('This is the find by GTYear section');
  Event.find({'year':{'$gt':year}, _tenant: req.user._tenant}).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/futureevents', authenticate, (req, res) => {
  // console.log('This is the find by gt date section');
  var thisDate = new Date();
  var demarcationDate = thisDate.setDate(thisDate.getDate() -10);
  // console.log(`This Moment: ${thisMoment}`);
  Event.find({
    startdate:{'$gt':demarcationDate},
    _tenant: req.user._tenant
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/pastevents', authenticate, (req, res) => {
  // console.log('This is the find by lt date section');
  var thisMoment = new Date();
  // console.log(`This Moment: ${thisMoment}`);
  Event.find({
    startdate:{'$lte':thisMoment},
    _tenant: req.user._tenant
  }).sort({year:1}).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/futureactiveevents', authenticate, (req, res) => {
  // console.log('Find by gt date and active invitation.');
  var thisDate = new Date();
  var demarcationDate = thisDate.setDate(thisDate.getDate() -10);
  // console.log(`This Moment: ${thisMoment}`);
  Event.find({
    startdate:{'$gt':demarcationDate},
    "invitation.active": true,
    _tenant: req.user._tenant
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/arevents', authenticate, (req, res) => {
  // console.log('Find by active invitation and requires registration.');
  Event.find({
    "invitation.registration.requiresRegistration": true,
    "invitation.active": true,
    _tenant: req.user._tenant
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/farevents', authenticate, (req, res) => {
  // console.log('Find by gt date, active invitation and requires registration');
  var thisMoment = new Date();
  // console.log(`This Moment: ${thisMoment}`);
  Event.find({
    startdate:{'$gt':thisMoment},
    "invitation.active": true,
    "invitation.registration.requiresRegistration": true,
    _tenant: req.user._tenant
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/count/:_eventtype', authenticate, (req, res) => {
  var _eventtype = req.params._eventtype;
  console.log(`Count events based on event with id ${_eventtype}, user: ${req.user._id}`);
  Event.find({
    _eventtype: _eventtype,
    _tenant: req.user._tenant
  }).countDocuments().then((count) => {
    var result = {"_eventtype":_eventtype,"count":count};
    res.json(result);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/summaryadmin/:year/:month/:date', authenticate, (req, res) => {
  // console.log('Find by gt date and summary not written');
  var theDate = new Date(req.params.year, req.params.month, req.params.date);
  var currentDate = new Date();
  // console.log(`This Date: ${theDate}. Current Date: ${currentDate}`);
  Event.find({
    startdate:{'$gt':theDate},
    enddate:{'$lte':currentDate},
    summaryExist: false,
    _tenant: req.user._tenant
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/past/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log('This is the find by LTEYear section');
  Event.find({'year':{'$lt':year}, _tenant: req.user._tenant}).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log('This is the findById section');

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  };

  Event.findOne({
    _id: id,
    _tenant: req.user._tenant
  }).then((event) => {
    if (!event) {
      return res.status(404).send();
    }

    res.send({event});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.get('/eventtype/:eventtype_id', authenticate, (req, res) => {
  var id = req.params.eventtype_id;
  // console.log('This is the find by eventtype section');

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
    console.log('Invalid Id');
  }

  Event.find({
    _tenant: req.user._tenant,
    _eventtype: id
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });

});

router.get('/eventtype/year/:eventtype_id/:year', authenticate, (req, res) => {
  var id = req.params.eventtype_id;
  // console.log('This is the find by eventtype section');
  // console.log(`Find Events by eventtype: ${id}, and year: ${req.params.year}`);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
    console.log('Invalid Id');
  }

  Event.find({
    _tenant: req.user._tenant,
    _eventtype: id,
    year: req.params.year
  }).then((events) => {
    res.json(events);
  }, (e) => {
    res.status(400).send(e);
  });

});

router.get('/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log('This is the find by Year section');

  Event.find({
    _tenant: req.user._tenant,
    year: year
  }).then((events) => {
    if (!events) {
      return res.status(404).send();
    }

    res.json(events);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, [
    'eventName',
    '_eventtype',
    'eventtypeName',
    'year',
    'description',
    'venue',
    'address',
    'website',
    'startdate',
    'enddate',
    'organizers',
    'committees',
    'invitation'
  ]);

  if (!ObjectId.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  Event.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$set: body}, {new: true}).then((event) => {
    if (!event) {
      console.log(`Event not found`);
      return res.status(404).send();
    }

    res.send({event});
  }).catch((e) => {
    console.log(`PATCH Event, Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  })
});

router.patch('/summary/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, [
    'summaryExist',
    '_summary'
  ]);

  if (!ObjectId.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  Event.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((event) => {
    if (!event) {
      console.log(`Event not found`);
      return res.status(404).send();
    }

    res.send({event});
  }).catch((e) => {
    console.log(`PATCH Event, Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  })
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Event.findOneAndDelete({
    _id: id,
    _creator: req.user._id
  }).then((event) => {
    if (!event) {
      return res.status(404).send();
    }

    res.json(event);
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;
