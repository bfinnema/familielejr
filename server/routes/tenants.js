const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Tenant} = require('../models/tenant');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  console.log(`In tenants. name: ${req.body.tenantName}, startYear: ${req.body.startYear}`);
  var tenant = new Tenant({
      tenantName: req.body.tenantName,
      description: req.body.description,
      subscriptions: req.body.subscriptions,
      startYear: req.body.startYear,
      _admin: req.user._id,
      _creator: req.user._id
  });

  tenant.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log(`Error: ${e}`);
    res.status(400).send(e);
  });
});

router.post('/noauth', (req, res) => {
  console.log(`name: ${req.body.tenantName}, startYear: ${req.body.startYear}`);
  var tenant = new Tenant({
      tenantName: req.body.tenantName,
      description: req.body.description,
      subscriptions: req.body.subscriptions,
      startYear: req.body.startYear
  });

  tenant.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log(`Error: ${e}`);
    res.status(400).send(e);
  });
});

router.get('/', authenticate, (req, res) => {
  Tenant.find({}).then((tenants) => {
    res.json(tenants);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/noauth', (req, res) => {
  Tenant.find({}).then((tenants) => {
    res.json(tenants);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Tenant.findOne({
    _id: id
  }).then((tenant) => {
    if (!tenant) {
      return res.status(404).send();
    }

    res.send({tenant});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Tenant.findOneAndRemove({
    _id: id
  }).then((tenant) => {
    if (!tenant) {
      return res.status(404).send();
    }

    res.json(tenant);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['tenantName', 'description', 'subscriptions']);
  // console.log(`Patching tenant, nsme: ${body.tenantName}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Tenant.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((tenant) => {
    if (!tenant) {
      return res.status(404).send();
    }

    res.json(tenant);
  }).catch((e) => {
    res.status(400).send();
  })
});

router.patch('/noauth/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['_admin', '_creator']);
  console.log(`Patching tenant, _admin id: ${body._admin}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Tenant.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((tenant) => {
    if (!tenant) {
      return res.status(404).send();
    }

    res.send(tenant);
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
