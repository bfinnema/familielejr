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
var {authenticate} = require('./middleware/authenticate');
multipartyMiddleware = multiparty();

const publicPath = path.join(__dirname, '../public');
var app = express();
const port = process.env.PORT;

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));

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
  var body = _.pick(req.body, ['email', 'name', 'address', 'phone']);
  User.findById(id).then((user) => {
    user.removeToken(req.token).then(() => {
      user.email = body.email;
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
/*
app.post('/users/me/password1', authenticate, (req, res) => {
  console.log(`New password: ${req.body.newpassword}`);
  user = req.user;
  user.password = req.body.newpassword;
  user.save().then(() => {
    res.json(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
})
*/
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
  // console.log('In server, user: '+req.user);
  // console.log(`In server: ${req.user.name.firstname}`);
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

app.post('/upload/photo', multipartyMiddleware, (req, res) => {
  console.log('Uploading Photos...');
  var file = req.files.file;
  console.log(file.name);
  console.log(file.type);
  console.log(file.size);
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
        console.log('New photo! Not found in db');
        var photo = new Photo({
          _creator: req.body.user,
          year: req.body.year,
          filename: file.name
        });

        photo.save().then((doc) => {
          res.send(doc);
        }, (e) => {
          res.status(400).send(e);
        });
        fs.rename(tmp_path, target_path, function(err) {
          if (err) throw err;
        }, () => {
          res.status(400).send();
        });
      } else {
        console.log('Photo already in db');
        res.status(409).send({photo});
      };
      fs.unlink(tmp_path, function(err) {
        if (err) throw err;
      });
    }).catch((e) => {
      res.status(400).send();
    });
    
    // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
  } else {
    res.status(400).send();
  };
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
