const {ObjectId} = require('mongodb');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

var {Eventtype} = require('../models/eventtype');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['eventtypeName', 'description', 'startYear', 'schedule', 'charge', 'agenda', 'agendaOrNot', 'participantCategories']);
    body._creator = req.user._id;
    body._tenant = req.user._tenant;
    var eventtype = new Eventtype(body);

    eventtype.save().then((doc) => {
        res.json(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    Eventtype.find({
        _tenant: req.user._tenant
    }).then((eventtypes) => {
        res.json(eventtypes);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/eventtypeName/:name', authenticate, (req, res) => {
    var name = req.params.name;
    Eventtype.findOne({
        _tenant: req.user._tenant,
        eventtypeName: name
    }).then((eventtype) => {
        res.json(eventtype);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Eventtype.findOne({
    _id: id,
    _tenant: req.user._tenant
  }).then((eventtype) => {
    if (!eventtype) {
      return res.status(404).send();
    }

    res.json(eventtype);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Eventtype.findOneAndDelete({
        _id: id,
        _tenant: req.user._tenant
    }).then((eventtype) => {
        if (!eventtype) {
        return res.status(404).send();
    }

        res.json(eventtype);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['eventtypeName', 'description', 'startYear', 'schedule', 'charge', 'agenda', 'agendaOrNot', 'participantCategories']);
    // console.log(`Patching Eventtype, Description: ${body.description}, Name: ${body.eventtypeName}`);

    body._creator = req.user._id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Eventtype.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$set: body}, {new: true}).then((eventtype) => {
        if (!eventtype) {
        return res.status(404).send();
        }

        res.json(eventtype);
    }).catch((e) => {
        res.status(400).send();
    })
});

module.exports = router;
