const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');

var {Doc} = require('../models/doc');
var {authenticate} = require('../middleware/authenticate');

aws.config.region = 'eu-west-2';
const S3_BUCKET = process.env.S3_BUCKET;

router.post('/upload', authenticate, (req, res) => {
  // console.log(req.body.description);
  var fn = req.body.filename;

  Doc.findOne({
    filename: fn
  }).then((doc) => {
    if (!doc) {
      var uploader = req.user.name.firstname;
      if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
      uploader = uploader + ' ' + req.user.name.surname;
      var doc = new Doc({
        _creator: req.body.user,
        year: req.body.year,
        filename: fn,
        filetype: req.body.filetype,
        category: req.body.category,
        uploader: uploader,
        orientation: req.body.orientation,
        description: req.body.description
      });

      doc.save().then((doc) => {
        res.send(doc);
      }, (e) => {
        res.status(400).send(e);
      });

    } else {
      console.log('Doc already in db');
      res.status(409).send({doc});
    };
  }).catch((e) => {
    res.status(400).send();
  });
    
});

router.get('/', authenticate, (req, res) => {
  Doc.find({}).then((docs) => {
    res.json(docs);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Doc.findOne({
    _id: id
  }).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    res.json(doc);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.get('/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`Docs, year: ${year}`);
  Doc.find({
    year: year
  }).then((docs) => {
    res.json(docs);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/yearandcat/:year/:category', authenticate, (req, res) => {
  var year = req.params.year;
  var category = req.params.category;
  // console.log(`Docs, year: ${year}, category: ${category}`);
  Doc.find({
    year: year,
    category: category
  }).then((docs) => {
    res.json(docs);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/category/:category', authenticate, (req, res) => {
    var category = req.params.category;
    // console.log(`Docs, category: ${category}`);
    Doc.find({
        category: category
    }).then((docs) => {
      res.json(docs);
    }, (e) => {
      res.status(400).send(e);
    });
  });
  
router.get('/my', authenticate, (req, res) => {
  // console.log(`My docs, user: ${req.user._id}`);
  Doc.find({
    _creator: req.user._id
  }).then((docs) => {
    res.json(docs);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/my/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`My docs year ${year}, user: ${req.user._id}`);
  Doc.find({
    _creator: req.user._id, year: year
  }).then((docs) => {
    res.json(docs);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/my/count/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`My docs year ${year}, user: ${req.user._id}`);
  Doc.find({
    _creator: req.user._id, year: year
  }).countDocuments().then((count) => {
    var result = {"year":year,"count":count};
    res.json(result);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/count/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`My docs year ${year}, user: ${req.user._id}`);
  Doc.find({
    year: year
  }).countDocuments().then((count) => {
    var result = {"year":year,"count":count};
    res.json(result);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Doc.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((doc) => {
    if (!doc) {
      return res.status(404).send();
    }

    // console.log(`Image ${doc.filename} removed`);
    res.json(doc);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/admindelete/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (req.user.role == 0) {
    Doc.findOneAndRemove({
      _id: id
    }).then((doc) => {
      if (!doc) {
        return res.status(404).send();
      }
  
      // console.log(`Image ${doc.filename} removed`);
      res.json(doc);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };

});

router.patch('/orientation/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`Rotation: ${req.body.orientation}`);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  };

  Doc.findOneAndUpdate({_id: id}, {$set: {'orientation': req.body.orientation}}).then((doc) => {
    if (!doc) {
      console.log(`Doc not found`);
      return res.status(404).send();
    }

    res.json(doc);
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;
