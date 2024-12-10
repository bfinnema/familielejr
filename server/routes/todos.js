const {ObjectId} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Todo} = require('../models/todo');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  var todo = new Todo({
    category: req.body.category,
    _tenant: req.user._tenant,
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/', authenticate, (req, res) => {
  // console.log(`Firstname: ${req.user.name.firstname}`);
  // console.log(`_tenant: ${req.user._tenant}`);
  Todo.find({_tenant: req.user._tenant}).then((todos) => {
    res.json(todos);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndDelete({
    _id: id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.json(todo);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['category', 'text', 'completed']);
  // console.log(`Patching tod, category: ${body.category}, Text: ${body.text}, Completed? ${body.completed}`);

  var uploader = req.user.name.firstname;
  if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
  uploader = uploader + ' ' + req.user.name.surname;
  body.completedBy = uploader;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
    body.completedBy = null;
  }

  Todo.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.json(todo);
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
