const {ObjectId} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Expense} = require('../models/expense');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['year', 'description', 'vendor', 'expensedate', 'expensetype', 'expenseprice']);
    var registeree = req.user.name.firstname;
    if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
    registeree = registeree + ' ' + req.user.name.surname
    body._creator = req.user._id;
    body.registeree = registeree;
    body._tenant = req.user._tenant;
    var expense = new Expense(body);

    expense.save().then((doc) => {
        res.json(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    Expense.find({
        _tenant: req.user._tenant
    }).then((expenses) => {
        res.json(expenses);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Expense.findOne({
    _id: id
  }).then((expense) => {
    if (!expense) {
      return res.status(404).send();
    }

    res.json(expense);
  }).catch((e) => {
    res.status(400).send();
  });
});

// Get all expenses for one year
router.get('/year/:year', authenticate, (req, res) => {
    var year = req.params.year;
    Expense.find({year: year, _tenant: req.user._tenant}).then((expenses) => {
        res.json(expenses);
    }, (e) => {
        res.status(400).send(e);
    });
});
  
router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Expense.findOneAndDelete({
        _id: id
    }).then((expense) => {
        if (!expense) {
        return res.status(404).send();
    }

        res.json(expense);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['year', 'description', 'vendor', 'expensedate', 'expensetype', 'expenseprice']);
    // console.log(`Patching Expense, Description: ${body.description}, price: ${body.expenseprice}`);

    var uploader = req.user.name.firstname;
    if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
    uploader = uploader + ' ' + req.user.name.surname;
    body.registeree = uploader;
    body._creator = req.user._id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Expense.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((expense) => {
        if (!expense) {
        return res.status(404).send();
        }

        res.json(expense);
    }).catch((e) => {
        res.status(400).send();
    })
});

module.exports = router;
