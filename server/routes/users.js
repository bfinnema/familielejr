const {ObjectId} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {User} = require('../models/user');
var {authenticate} = require('../middleware/authenticate');

router.post('/', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'confirmpwd', 'role', 'name', 'address', 'phone', 'secret', '_tenant']);
  console.log(`Email: ${body.email}, Name: ${body.name.firstname} ${body.name.middlename} ${body.name.surname}`);
  console.log(`Secret and passwords: ${body.secret}, ${body.password}, ${body.confirmpwd}, ${body.role}`);
  console.log(`_tenant: ${body._tenant}`);
  if (body.secret == process.env.REGISTRATION_SECRET && body.password == body.confirmpwd) {
    console.log('Secret approved and passwords equal.');
    var user = new User(body);

    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).json(user);
    }).catch((e) => {
      res.status(400).send(e);
    });
  } else {
    res.status(401).send();
  };
});

// Change profile
router.patch('/me/edit/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'address', 'phone']);
  User.findById(id).then((user) => {
    user.removeToken(req.token).then(() => {
      user.name = body.name;
      user.address = body.address;
      user.phone = body.phone;
      user.save().then(() => {
        return user.generateAuthToken();
      }).then((token) => {
        res.header('x-auth', token).json(user);
      });
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// Change role
router.patch('/role/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['role']);
  // console.log(`Status: ${body.role}`);
  User.findOneAndUpdate({_id: id}, {$set: {'role': body.role}}).then((user) => { // , {new: true}
    if (!user) {
      console.log('User not found');
      return res.status(404).send();
    }

    res.send({user});
  }).catch((e) => {
    res.status(400).send();
  });
});

// Change password
router.post('/me/password', authenticate, (req, res) => {
  // console.log(`Password: ${req.body.password}, New password: ${req.body.newpassword}, Repeat password: ${req.body.confirmnpwd}`);
  if (req.body.newpassword == req.body.confirmnpwd) {
    User.findByCredentials(req.user.email, req.body.password).then((user) => {
      user.removeToken(req.token).then(() => {
        user.password = req.body.newpassword;
        user.save().then(() => {
          return user.generateAuthToken();
        }).then((token) => {
          res.header('x-auth', token).json(user);
        });
      });
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };
})

// Forgotten password
router.post('/password/:id', authenticate, (req, res) => {
  var id = req.params.id;
  console.log(`New password: ${req.body.newpassword}, Repeat password: ${req.body.confirmnpwd}`);
  if (req.body.newpassword == req.body.confirmnpwd && req.user.role == 0) {
    User.findById(id).then((user) => {
      console.log(`Found User: ${user.email}`);
      user.password = req.body.newpassword;
      user.save().then((user) => {
        res.json(user);
      });
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };
})

// Check logged in user
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

router.post('/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  // console.log(`Email: ${body.email}, ${body.password}`);
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).json(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

// Get users from one tenant
router.get('/', authenticate, (req, res) => {
  var _tenant = req.user._tenant;
  if (req.user.role < 3) {
    User.find({
      _tenant: _tenant
    }).then((users) => {
      res.json(users);
    }, (e) => {
      res.status(400).send(e);
    });
  } else {
    res.status(401).send();
  };
});

// Get all users from all tenants
router.get('/all', authenticate, (req, res) => {
  if (req.user.role < 3) {
    User.find({}).then((users) => {
      res.json(users);
    }, (e) => {
      res.status(400).send(e);
    });
  } else {
    res.status(401).send();
  };
});

router.get('/sort/:sortBy/:sortDirection', authenticate, (req, res) => {
  var _tenant = req.user._tenant;
  // console.log(`sortBy: ${req.params.sortBy}, sortDirection: ${req.params.sortDirection}`);
  var sd = 1;
  if (req.params.sortDirection == "up") {sd = -1};
  // console.log(`sd: ${sd}`);
  if (req.user.role < 3) {
    if (req.params.sortBy == "firstname") {
      User.find({_tenant: _tenant}).sort({"name.firstname": sd ,"name.surname": sd}).then((users) => {
        res.json(users);
      }, (e) => {
        res.status(400).send(e);
      });
    } else {
      User.find({_tenant: _tenant}).sort({"name.surname": sd ,"name.firstname": sd}).then((users) => {
        res.json(users);
      }, (e) => {
        res.status(400).send(e);
      });
    };
  } else {
    res.status(401).send();
  };
});

router.get('/search/:searchCriteria/:searchText', authenticate, (req, res) => {
  var _tenant = req.user._tenant;
  // console.log(`searchCriteria: ${req.params.searchCriteria}, searchText: ${req.params.searchText}`);
  var sd = 1;
  if (req.user.role < 3) {
    if (req.params.searchCriteria == "Fornavn") {
      User.find({"name.firstname": req.params.searchText, _tenant: _tenant}).sort({"name.surname": sd}).then((users) => {
        res.json(users);
      }, (e) => {
        res.status(400).send(e);
      });
    } else if (req.params.searchCriteria == "Efternavn") {
      User.find({"name.surname": req.params.searchText, _tenant: _tenant}).sort({"name.firstname": sd}).then((users) => {
        res.json(users);
      }, (e) => {
        res.status(400).send(e);
      });
    } else {
      User.find({"email": req.params.searchText, _tenant: _tenant}).then((users) => {
        res.json(users);
      }, (e) => {
        res.status(400).send(e);
      });
    };
  } else {
    res.status(401).send();
  };
});

router.get('/user/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (req.user.role < 2) {
    User.findById(id).then((user) => {
      console.log(`Found User: ${user.email}`);
      res.json(user);
    }, (e) => {
      res.status(400).send(e);
    });
  } else {
    res.status(401).send();
  };
});

// Count all users from all tenants
router.get('/count/all', (req, res) => {
  User.find({}).countDocuments().then((count) => {
    // console.log(`Number of users: ${count}`);
    res.json(count);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Count users from one tenant
router.get('/count', (req, res) => {
  var _tenant = req.user._tenant;
  User.find({
    _tenant: _tenant
  }).countDocuments().then((count) => {
    // console.log(`Number of users: ${count}`);
    res.json(count);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(id);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
    // console.log('ID not accepted');
  };

  if (req.user._id == id) {console.log('You cannot delete yourself');};

  if (req.user.role == 0 && req.user._id != id) {
    User.findOneAndDelete({
      _id: id
    }).then((user) => {
      if (!user) {
        return res.status(404).send();
        // console.log('User not found');
      }

      res.json(user);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };

});

module.exports = router;
