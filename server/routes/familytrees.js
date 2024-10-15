const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Familytree} = require('../models/familytree');
var {authenticate} = require('../middleware/authenticate');

router.post('/', authenticate, (req, res) => {
  // console.log(`Tenant: ${req.user._tenant}, level: ${req.body.level}, parent: ${req.body._parent_id}, family: ${req.body._family_id}, klan: ${req.body.klan}, description: ${req.body.description}, _kid: ${req.body._kid}, ${req.body.persons[0].firstname}`);

  var familytree = new Familytree({
    _admin: req.user._id,
    _tenant: req.user._tenant,
    level: req.body.level,
    klan: req.body.klan,
    description: req.body.description,
    _kid: req.body._kid,
    _parent_id: req.body._parent_id,
    _family_id: req.body._family_id,
    persons: req.body.persons
  });

  familytree.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log(e)
    res.status(400).send(e);
  });
});

router.get('/', authenticate, (req, res) => {
  Familytree.find({
    _tenant: req.user._tenant
  }).then((familytrees) => {
    // console.log(`Familytree: ${familytrees[0]}`);
    res.json(familytrees);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:level', authenticate, (req, res) => {
  var level = req.params.level;
  // console.log(`Klan: ${klan}`);

  Familytree.find({
    _tenant: req.user._tenant,
    level: level
  }).then((familytrees) => {
    if (!familytrees) {
      return res.status(404).send();
    }

    res.json(familytrees);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.get('/parent_kid/:parent_id/:kid', authenticate, (req, res) => {
  var _parent_id = req.params.parent_id;
  var _kid = req.params.kid;
  // console.log(`_parent_id: ${_parent_id}. _kid: ${_kid}`);

  Familytree.find({
    _tenant: req.user._tenant,
    _parent_id: _parent_id,
    _kid: _kid
  }).then((familytrees) => {
    if (!familytrees) {
      return res.status(404).send();
    }

    res.json(familytrees);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.get('/parent/:parent_id', authenticate, (req, res) => {
  var _parent_id = req.params.parent_id;
  // console.log(`Klan: ${klan}`);

  Familytree.find({
    _tenant: req.user._tenant,
    _parent_id: _parent_id
  }).then((familytrees) => {
    if (!familytrees) {
      return res.status(404).send();
    }

    res.json(familytrees);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`id: ${id}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Familytree.findOneAndUpdate(
    {_id: id},
    {
      $push: {
          secondlevel: {
              _family_id: req.body._family_id,
              persons: req.body.persons
          }
      }
    },
    {new: true}
  ).then((familytree) => {
    if (!familytree) {
      return res.status(404).send();
    }

    res.json(familytree);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/l2/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`familytree/l2. id: ${id}, _parent_id: ${req.body._parent_id}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Familytree.findOneAndUpdate(
    {_id: id, "secondlevel._family_id": req.body._parent_id},
    {
      $push: {
        "secondlevel.$.thirdlevel": {
          _family_id: req.body._family_id,
          persons: req.body.persons
        }
      }
    },
    {new: true}
  ).then((familytree) => {
    if (!familytree) {
      return res.status(404).send();
    }

    res.json(familytree);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/edit/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`familytree/edit, id: ${id}, _family_id: ${req.body._family_id}, _parent_id: ${req.body._parent_id}, L1Index: ${req.body.l1index}, L2Index: ${req.body.l2index}`);
  // console.log(`Persons, firstname: ${req.body.persons[0].firstname}`);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  };

  var filter = JSON.parse('{"_id":"'+id+'"}');
  var setString = '{"persons":'+JSON.stringify(req.body.persons)+'}';
  if (req.body.level == 1 || req.body.level == 4) {
    // console.log(`Edit at level 1 or 4`);
    filter = JSON.parse('{"_id":"'+id+'", "secondlevel._family_id":'+req.body._family_id+'}');
    setString = '{"secondlevel.$.persons":'+JSON.stringify(req.body.persons)+'}';
  } else if (req.body.level == 2 || req.body.level == 5) {
    setString = '{"secondlevel.'+req.body.l1index+'.thirdlevel.'+req.body.l2index+'.persons":'+JSON.stringify(req.body.persons)+'}';
  } else {
    console.log(`Edit at level 0 or 3`);
  };

  // console.log(`Filter ${JSON.stringify(filter)}`);
  // console.log(`setString: ${setString}`);
  var setQuery = JSON.parse(setString);
  var query = {$set: setQuery};

  Familytree.findOneAndUpdate(
    filter,
    query
  ).then((familytree) => {
    if (!familytree) {
      return res.status(404).send();
    }

    res.json(familytree);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/delete/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`id: ${id}`);
  // console.log(`familytree/delete, id: ${id}, _family_id: ${req.body._family_id}, _parent_id: ${req.body._parent_id}, L1Index: ${req.body.l1index}, L2Index: ${req.body.l2index}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (req.body.level == 1 || req.body.level == 4) {
    // console.log(`Delete at level 1 or 4`);
    Familytree.findOneAndUpdate(
      {_id: id},
      {
          $pull: {
              "secondlevel": {"_family_id": req.body._family_id}
          }
      }
    ).then((familytree) => {
      if (!familytree) {
        return res.status(404).send();
      }
  
      res.json(familytree);
    }).catch((e) => {
      res.status(400).send();
    });
  } else if (req.body.level == 2 || req.body.level == 5) {
    // console.log(`Delete at level 2 or 5`);
    Familytree.findOneAndUpdate(
      {_id: id, "secondlevel._family_id": req.body._parent_id},
      {
          $pull: {
              "secondlevel.$.thirdlevel": {"_family_id": req.body._family_id}
          }
      }
    ).then((familytree) => {
      if (!familytree) {
        return res.status(404).send();
      }
  
      res.json(familytree);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    console.log(`Delete at level 0 or 3`);
  };
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Familytree.findOneAndRemove({
    _id: id
  }).then((familytree) => {
    if (!familytree) {
      return res.status(404).send();
    }

    res.json(familytree);
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = router;
