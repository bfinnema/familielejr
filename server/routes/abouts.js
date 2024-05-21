const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {About} = require('../models/about');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  // console.log(`Firstname: ${req.user.name.firstname}`);
  // console.log(`_tenant: ${req.user._tenant}`);
  var about = new About({
    _tenant: req.body._tenant,
    communityName: req.body.communityName,
    subHeading: req.body.subHeading,
    nextHeadline: req.body.nextHeadline,
    upcomingHeadline: req.body.upcomingHeadline,
    metadata: req.body.metadata,
    textHeadlines: req.body.textHeadlines,
    _creator: req.user._id
  });

  about.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log(`Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  });
});

router.post('/noauth', (req, res) => {
  console.log(`In abouts. communityName: ${req.body.communityName}`);
  var about = new About({
    _tenant: req.body._tenant,
    communityName: req.body.communityName,
    subHeading: req.body.subHeading,
    nextHeadline: req.body.nextHeadline,
    upcomingHeadline: req.body.upcomingHeadline,
    metadata: req.body.metadata,
    textHeadlines: req.body.textHeadlines
  });

  about.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log(`Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  });
});

router.get('/', authenticate, (req, res) => {
  About.find({
    _tenant: req.user._tenant
  }).then((abouts) => {
    res.json(abouts);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log('This is the findById section');

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  };

  About.findById(id).then((about) => {
    if (!about) {
      return res.status(404).send();
    };

    res.send({about});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  // console.log(`Firstname: ${req.user.name.firstname}`);
  // console.log(`_tenant: ${req.user._tenant}`);
  var id = req.params.id;
  var body = _.pick(req.body, ['communityName', 'subHeading', 'nextHeadline', 'upcomingHeadline', 'metadata', 'textHeadlines']);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  About.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((about) => {
    if (!about) {
      console.log(`About not found`);
      return res.status(404).send();
    };

    res.send({about});
  }).catch((e) => {
    console.log(`Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  })
});

router.patch('/noauth/:id', (req, res) => {
  console.log(`_creator: ${req.body._creator}`);
  var id = req.params.id;
  var body = _.pick(req.body, ['_creator']);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  };

  About.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((about) => {
    if (!about) {
      console.log(`About not found`);
      return res.status(404).send();
    };

    res.send({about});
  }).catch((e) => {
    console.log(`Error code: ${e.code}`);
    if (e.code == 11000) {
      res.status(409).send(e);
    } else {
      res.status(400).send(e);
    };
  })
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  };

  About.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((about) => {
    if (!about) {
      return res.status(404).send();
    };

    res.json(about);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/tenant/:_tenant', authenticate, (req, res) => {
  var _tenant = req.params._tenant;
  console.log(`Tenant ID: ${_tenant}`);

  if (!ObjectID.isValid(_tenant)) {
    return res.status(404).send();
  };

  About.findOneAndRemove({
    _tenant: _tenant
  }).then((about) => {
    if (!about) {
      return res.status(404).send();
    };

    res.json(about);
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;
