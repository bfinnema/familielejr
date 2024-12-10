const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
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
    body._tenant = req.user._tenant;
    var nauser = new Nauser(body);

    nauser.save().then((nonactiveuser) => {
        res.json(nonactiveuser);
    }, (e) => {
        console.log(`Error: ${e}`);
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    Nauser.find({_tenant: req.user._tenant}).then((nonactiveusers) => {
        res.json(nonactiveusers);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/sort/:sortBy/:sortDirection', authenticate, (req, res) => {
    // console.log(`NAusers. sortBy: ${req.params.sortBy}, sortDirection: ${req.params.sortDirection}`);
    var sd = 1;
    if (req.params.sortDirection == "up") {sd = -1};
    // console.log(`NA sd: ${sd}`);
    if (req.params.sortBy == "firstname") {
        Nauser.find({
            _tenant: req.user._tenant
        }).sort({"name.firstname": sd ,"name.surname": sd}).then((nonactiveusers) => {
            res.json(nonactiveusers);
        }, (e) => {
            res.status(400).send(e);
        });
    } else {
        Nauser.find({_tenant: req.user._tenant}).sort({"name.surname": sd ,"name.firstname": sd}).then((nonactiveusers) => {
            res.json(nonactiveusers);
        }, (e) => {
            res.status(400).send(e);
        });
    };
});

router.get('/search/:searchCriteria/:searchText/:tenantName', authenticate, (req, res) => {
    // console.log(`searchCriteria: ${req.params.searchCriteria}, searchText: ${req.params.searchText}`);
    var tenantName = req.params.tenantName;
    var sd = 1;
    if (req.params.searchCriteria == "Fornavn") {
        Nauser.find({"name.firstname": req.params.searchText, _tenant: req.user._tenant}).sort({"name.surname": sd}).then((nonactiveusers) => {
            res.json(nonactiveusers);
        }, (e) => {
            res.status(400).send(e);
        });
    } else if (req.params.searchCriteria == "Efternavn") {
        Nauser.find({"name.surname": req.params.searchText, _tenant: req.user._tenant}).sort({"name.firstname": sd}).then((nonactiveusers) => {
            res.json(nonactiveusers);
        }, (e) => {
            res.status(400).send(e);
        });
    } else {
        Nauser.find({"email": req.params.searchText, _tenant: req.user._tenant}).then((nonactiveusers) => {
            res.json(nonactiveusers);
        }, (e) => {
            res.status(400).send(e);
        });
    };
});

router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
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

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Nauser.findOneAndDelete({
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

    if (!ObjectId.isValid(id)) {
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
