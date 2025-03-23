const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Grocery} = require('../models/grocery');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['groceryname', 'grocerytype', 'logging', 'measure', 'tenantName']);
    // console.log(`New Grocery, Vare: ${body.groceryname}, measure: ${body.measure}`);
    body._creator = req.user._id;
    body._tenant = req.user._tenant;
    var grocery = new Grocery(body);

    grocery.save().then((doc) => {
        res.json(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    Grocery.find({
        _tenant: req.user._tenant
    }).then((groceries) => {
        res.json(groceries);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Grocery.findOne({
    _id: id,
    _tenant: req.user._tenant
  }).then((grocery) => {
    if (!grocery) {
      return res.status(404).send();
    }

    res.json(grocery);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Grocery.findOneAndDelete({
        _id: id,
        _tenant: req.user._tenant
    }).then((grocery) => {
        if (!grocery) {
        return res.status(404).send();
    }

        res.json(grocery);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['groceryname', 'grocerytype', 'measure']);
    console.log(`Patching Grocery, greocery name: ${body.groceryname}, grocerytype: ${body.grocerytype}`);

    body._creator = req.user._id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Grocery.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$set: body}, {new: true}).then((grocery) => {
        if (!grocery) {
        return res.status(404).send();
        }

        res.json(grocery);
    }).catch((e) => {
        res.status(400).send();
    })
});

router.patch('/logging/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['logging']);
    /* console.log(`Patching Logging:`);
    for (i=0; i<body.logging.length; i++) {
        console.log(`Year: ${body.logging[i].year}, Quantity consumed: ${body.logging[i].quantityconsumed}`)
    }; */

    body._creator = req.user._id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Grocery.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((grocery) => {
        if (!grocery) {
        return res.status(404).send();
        }

        res.json(grocery);
    }).catch((e) => {
        res.status(400).send();
    })
});

module.exports = router;
