const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Game} = require('../models/game');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  var game = new Game({
    name: req.body.name,
    _tenant: req.user._tenant,
    description: req.body.description,
    _creator: req.user._id,
    createdBy: registeree
  });

  game.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/', authenticate, (req, res) => {
  Game.find({_tenant: req.user._tenant}).then((games) => {
    res.json(games);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOne({
    _id: id,
    _tenant: req.user._tenant
  }).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.send({game});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOneAndDelete({
    _id: id,
    _tenant: req.user._tenant
  }).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.json(game);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'description']);
  // console.log(`Patching game, category: ${body.name}, Description: ${body.description}`);

  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  body.createdBy = registeree;
  body._creator = req.user._id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$set: body}, {new: true}).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.json(game);
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
