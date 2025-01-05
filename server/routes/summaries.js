const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Summary} = require('../models/summary');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  // console.log(`name: ${req.body.name}, meetingdate: ${req.body.meetingdate}, agenda point 0: ${req.body.agenda[0].item}`);
  var summary = new Summary({
      name: req.body.name,
      _tenant: req.user._tenant,
      agenda: req.body.agenda,
      meetingdate: req.body.meetingdate,
      visible: req.body.visible,
      _creator: req.user._id,
      _event: req.body._event
  });

  summary.save().then((summary) => {
      res.json(summary);
  }, (e) => {
    // console.log(e);
    console.log(`Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  });
});

router.get('/', authenticate, (req, res) => {
  Summary.find({_tenant: req.user._tenant}).then((summaries) => {
    res.json(summaries);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Summary.findOne({
    _id: id
  }).then((summary) => {
    if (!summary) {
      return res.status(404).send();
    }

    res.send({summary});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Summary.findOneAndDelete({
    _id: id
  }).then((summary) => {
    if (!summary) {
      return res.status(404).send();
    }

    res.json(summary);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'agenda', 'meetingdate', 'visible']);
  // console.log(`Patching summary, agenda point: ${body.agenda}`);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Summary.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((summary) => {
    if (!summary) {
      return res.status(404).send();
    }

    res.json(summary);
  }).catch((e) => {
    console.log(`Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  })
});

module.exports = router;
