const {ObjectId} = require('mongodb');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

var {Place} = require('../models/place');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['placeName', 'placetypeName', 'description', 'address', 'coordinates', 'website', 'events']);
    console.log(`New place: ${body.placeName}, description: ${body.description}`);
    body._creator = req.user._id;
    body._tenant = req.user._tenant;
    var place = new Place(body);

    place.save().then((doc) => {
        res.json(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/', authenticate, (req, res) => {
    Place.find({_tenant: req.user._tenant}).then((places) => {
        res.json(places);
    }, (e) => {
        res.status(400).send(e);
    });
});

router.get('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Place.findOne({
        _id: id,
        _tenant: req.user._tenant
    }).then((place) => {
        if (!place) {
            return res.status(404).send();
        }

        res.send({place});
    }).catch((e) => {
        res.status(400).send();
    });
});

router.delete('/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Place.findOneAndDelete({
        _id: id,
        _tenant: req.user._tenant
    }).then((place) => {
        if (!place) {
            return res.status(404).send();
        }

        res.json(place);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['placeName', 'placetypeName', 'description', 'address', 'coordinates', 'website', 'events']);
    console.log(`Patching place: ${body.placeName}, Description: ${body.description}`);

    body._creator = req.user._id;

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    };

    Place.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$set: body}, {new: true}).then((place) => {
        if (!place) {
            return res.status(404).send();
        }

        res.json(place);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/deleteevent/:id/:event', authenticate, (req, res) => {
    var id = req.params.id;
    var event = req.params.event;
    // console.log(`Removing event`);

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    };

    if (!ObjectId.isValid(event)) {
        return res.status(404).send();
    };

    Place.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$pull: {events: {_event: event}}}, {new: true}).then((place) => {
        if (!place) {
            return res.status(404).send();
        }

        res.json(place);
    }).catch((e) => {
        res.status(400).send();
    });
});

router.patch('/addevent/:id/:event', authenticate, (req, res) => {
    var id = req.params.id;
    var event = req.params.event;
    // console.log(`Adding event: ${req.body.year}, ${req.body.eventName}`);

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    };

    if (!ObjectId.isValid(event)) {
        return res.status(404).send();
    };

    Place.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$push: {events: {_event: event, eventName: req.body.eventName, year: req.body.year}}}, {new: true}).then((place) => {
        if (!place) {
            return res.status(404).send();
        }

        res.json(place);
    }).catch((e) => {
        res.status(400).send();
    });
});

module.exports = router;
