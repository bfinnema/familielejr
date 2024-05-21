const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Income} = require('../models/income');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['year', 'description', 'source', 'incomedate', 'incometype', 'incomeamount']);
    var registeree = req.user.name.firstname;
    if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
    registeree = registeree + ' ' + req.user.name.surname
    body._creator = req.user._id;
    body.registeree = registeree
    body._tenant = req.user._tenant;
    var income = new Income(body);

    income.save().then((doc) => {
        res.json(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    Income.find({
        _tenant: req.user._tenant
    }).then((incomes) => {
        res.json(incomes);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Income.findOne({
    _id: id
  }).then((income) => {
    if (!income) {
      return res.status(404).send();
    }

    res.json(income);
  }).catch((e) => {
    res.status(400).send();
  });
});

// Get all incomes for one year
router.get('/year/:year', authenticate, (req, res) => {
    var year = req.params.year;
    Income.find({year: year, _tenant: req.user._tenant}).then((incomes) => {
        res.json(incomes);
    }, (e) => {
        res.status(400).send(e);
    });
});
  
router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Income.findOneAndRemove({
        _id: id
    }).then((income) => {
        if (!income) {
        return res.status(404).send();
    }

        res.json(income);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['year', 'description', 'source', 'incomedate', 'incometype', 'incomeamount']);
    console.log(`Patching Income, Description: ${body.description}, price: ${body.incomeamount}`);

    var uploader = req.user.name.firstname;
    if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
    uploader = uploader + ' ' + req.user.name.surname;
    body.registeree = uploader;
    body._creator = req.user._id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Income.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((income) => {
        if (!income) {
        return res.status(404).send();
        }

        res.json(income);
    }).catch((e) => {
        res.status(400).send();
    })
});

module.exports = router;
