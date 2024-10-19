const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {FiscalYear} = require('../models/fiscalyear');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['year', 'description', 'locked', 'initiated', 'assetsStart', 'participantsFee', 'incomeTotal', 'expensesTotal', 'result', 'assetsEnd']);
    var registeree = req.user.name.firstname;
    if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
    registeree = registeree + ' ' + req.user.name.surname
    body._creator = req.user._id;
    body.registeree = registeree
    var fiscalyear = new FiscalYear(body);

    fiscalyear.save().then((doc) => {
        res.json(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    FiscalYear.find({}).then((fiscalyears) => {
        res.json(fiscalyears);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    FiscalYear.findOne({
        _id: id
    }).then((fiscalyear) => {
        if (!fiscalyear) {
            return res.status(404).send();
        }

        res.json(fiscalyear);
    }).catch((e) => {
        res.status(400).send();
    });
});

// Get fiscalyear for one year
router.get('/year/:year', (req, res) => {
    var year = req.params.year;
    FiscalYear.findOne({
        year: year
    }).then((fiscalyear) => {
        if (!fiscalyear) {
            return res.status(404).send();
        }
        res.json(fiscalyear);
    }).catch((e) => {
        res.status(400).send();
    });
});
  
router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    FiscalYear.findOneAndDelete({
        _id: id
    }).then((fiscalyear) => {
        if (!fiscalyear) {
        return res.status(404).send();
    }

        res.json(fiscalyear);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['year', 'description', 'locked', 'initiated', 'assetsStart', 'participantsFee', 'incomeTotal', 'expensesTotal', 'result', 'assetsEnd']);
    // console.log(`Patching Fiscalyear, Description: ${body.description}, Asset at start: ${body.assetsStart}`);

    var uploader = req.user.name.firstname;
    if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
    uploader = uploader + ' ' + req.user.name.surname;
    body.registeree = uploader;
    body._creator = req.user._id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    FiscalYear.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((fiscalyear) => {
        if (!fiscalyear) {
            return res.status(404).send();
        }

        res.json(fiscalyear);
    }).catch((e) => {
        res.status(400).send();
    })
});

router.patch('/locked/:id', authenticate, (req, res) => {
    var id = req.params.id;
    // console.log(`Locked status: ${req.body.locked}`);

    if (!ObjectId.isValid(id)) {
        console.log(`id is not valid`);
        return res.status(404).send();
    };

    FiscalYear.findOneAndUpdate({_id: id}, {$set: {'locked': req.body.locked}}).then((fiscalyear) => {
        if (!fiscalyear) {
            console.log(`Fiscalyear not found`);
            return res.status(404).send();
        }

        res.json(fiscalyear);
    }).catch((e) => {
        res.status(400).send();
    });
});

module.exports = router;
