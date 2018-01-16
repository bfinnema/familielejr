const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Futurecamp} = require('../models/futurecamp');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  var futurecamp = new Futurecamp({
    year: req.body.year,
    camp: req.body.camp,
    address: req.body.address,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    organizers: req.body.organizers,
    committees: req.body.committees,
    _creator: req.user._id
  });

  futurecamp.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/', authenticate, (req, res) => {
  Futurecamp.find({}).then((futurecamps) => {
    res.json(futurecamps);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/future/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log('This is the find by GTYear section');
  Futurecamp.find({'year':{'$gt':year}}).then((futurecamps) => {
    res.json(futurecamps);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log('This is the findById section');

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
    console.log('Invalid Id');
  }

  Futurecamp.findById(id).then((futurecamp) => {
    if (!futurecamp) {
      return res.status(404).send();
    }

    res.send({futurecamp});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.get('/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log('This is the find by Year section');

  Futurecamp.findOne({
    year: year
  }).then((futurecamp) => {
    if (!futurecamp) {
      return res.status(404).send();
    }

    res.send({futurecamp});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['year', 'camp', 'address', 'startdate', 'enddate', 'organizers', 'committees']);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  Futurecamp.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((futurecamp) => {
    if (!futurecamp) {
      console.log(`Futurecamp not found`);
      return res.status(404).send();
    }

    res.send({futurecamp});
  }).catch((e) => {
    res.status(400).send();
  })
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Futurecamp.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((futurecamp) => {
    if (!futurecamp) {
      return res.status(404).send();
    }

    res.json(futurecamp);
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;
