const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Nauser} = require('../models/nonactiveuser');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['email', 'name', 'address', 'phone']);
    // console.log(`Email: ${body.email}, Firstname: ${body.name.firstname}`);
    var registeree = req.user.name.firstname;
    if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
    registeree = registeree + ' ' + req.user.name.surname
    body.createdBy = registeree;
    body._creator = req.user._id;
    var nauser = new Nauser(body);

    nauser.save().then((nonactiveuser) => {
        res.json(nonactiveuser);
    }, (e) => {
        console.log(`Error: ${e}`);
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    Nauser.find({}).then((nonactiveusers) => {
        res.json(nonactiveusers);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Nauser.findOne({
        _id: id
    }).then((nonactiveuser) => {
        if (!nonactiveuser) {
            return res.status(404).send();
        }

        res.json(nonactiveuser);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Nauser.findOneAndRemove({
        _id: id
    }).then((nonactiveuser) => {
        if (!nonactiveuser) {
            return res.status(404).send();
        }

        res.json(nonactiveuser);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['email', 'name', 'address', 'phone']);
    // console.log(`Patching non-active user: ${body.name}, email: ${body.email}`);

    var registeree = req.user.name.firstname;
    if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
    registeree = registeree + ' ' + req.user.name.surname
    body.createdBy = registeree;
    body._creator = req.user._id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Nauser.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((nonactiveuser) => {
        if (!nonactiveuser) {
            return res.status(404).send();
        }

        res.json(nonactiveuser);
    }).catch((e) => {
        res.status(400).send();
    })
});

module.exports = router;
