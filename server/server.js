require('./config/config');

const _ = require('lodash');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const multiparty = require('connect-multiparty');
const fs = require('fs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {Photo} = require('./models/photo');
var {Eventreg} = require('./models/eventreg');
var {authenticate} = require('./middleware/authenticate');
multipartyMiddleware = multiparty();

const publicPath = path.join(__dirname, '../public');
var app = express();
const port = process.env.PORT;

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));

app.post('/eventreg', authenticate, (req, res) => {
  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  var eventreg = new Eventreg({
    name: req.body.name,
    agegroup: req.body.agegroup,
    arrivalday: req.body.arrivalday,
    arrivaltime: req.body.arrivaltime,
    departureday: req.body.departureday,
    departuretime: req.body.departuretime,
    _creator: req.user._id,
    registeree: registeree
  });

  eventreg.save().then ((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
})

app.get('/eventreg', authenticate, (req, res) => {
  Eventreg.find({
    _creator: req.user._id
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/eventregall', (req, res) => {
  Eventreg.find({}).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.delete('/eventreg/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Eventreg.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((eventreg) => {
    if (!eventreg) {
      return res.status(404).send();
    }

    res.json(eventreg);
  }).catch((e) => {
    res.status(400).send();
  });
});

// Todo Section
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'name', 'address', 'phone', 'secret']);
  console.log(`Email: ${body.email}, password: ${body.password}`);
  console.log(`Name: ${body.name.firstname} ${body.name.middlename} ${body.name.surname}`);
  console.log(`Secret: ${body.secret}`);
  if (body.secret == process.env.REGISTRATION_SECRET) {
    console.log('Secret approved.');
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

app.patch('/users/me/edit/:id', authenticate, (req, res) => {
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

// Change password
app.post('/users/me/password', authenticate, (req, res) => {
  console.log(`Password: ${req.body.password}, New password: ${req.body.newpassword}`);
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
})

// Check logged in user
app.get('/users/me', authenticate, (req, res) => {
  res.json(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).json(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

// Photos
app.post('/photos/upload', authenticate, multipartyMiddleware, (req, res) => {
  var file = req.files.file;
  // get the temporary location of the file
  var tmp_path = req.files.file.path;
  console.log(tmp_path);
  // set where the file should actually exists - in this case it is in the "images" directory
  var target_path = __dirname + '/../public/images/' + req.body.year + '/' + req.files.file.name;
  var path = __dirname + '/../public/images/' + req.body.year;
  console.log(target_path);
  console.log(path);
  // move the file from the temporary location to the intended location
  if (fs.existsSync(path)) {

    Photo.findOne({
      filename: file.name
    }).then((photo) => {
      if (!photo) {
        var uploader = req.user.name.firstname;
        if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
        uploader = uploader + ' ' + req.user.name.surname
        var photo = new Photo({
          _creator: req.body.user,
          year: req.body.year,
          filename: file.name,
          path: 'images/' + req.body.year + '/',
          uploader: uploader
        });

        photo.save().then((doc) => {
          res.send(doc);
        }, (e) => {
          res.status(400).send(e);
        });

        // Read the file
        fs.readFile(tmp_path, function (err, data) {
          if (err) throw err;
          console.log('File read!');

          // Write the file
          fs.writeFile(target_path, data, function (err) {
            if (err) throw err;
            // res.write('File uploaded and moved!');
            // res.end();
            console.log('File written!');
          });

          // Delete the file
          fs.unlink(tmp_path, function (err) {
            if (err) throw err;
            console.log('File deleted!');
          });
        });
/*
        fs.rename(tmp_path, target_path, function(err) {
          if (err) throw err;
        }, () => {
          res.status(400).send();
        });
*/        
      } else {
        console.log('Photo already in db');
        res.status(409).send({photo});
        fs.unlink(tmp_path, function(err) {
          if (err) throw err;
        });
      };
    }).catch((e) => {
      res.status(400).send();
    });
    
    // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
  } else {
    res.status(400).send();
  };
});

app.get('/photos/:year', authenticate, (req, res) => {
  var year = req.params.year;
  Photo.find({
    year: year
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
})

app.get('/myphotos', authenticate, (req, res) => {
  var year = req.params.year;
  Photo.find({
    _creator: req.user._id
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
})

app.delete('/photos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Photo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((photo) => {
    if (!photo) {
      return res.status(404).send();
    }

    fs.unlink(__dirname + '/../public/' + photo.path+photo.filename, function(err) {
      if (err) throw err;
    });
    console.log(`Image ${photo.filename} removed`);
    res.json(photo);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
