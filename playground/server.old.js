require('./config/config');

const _ = require('lodash');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
// const multiparty = require('connect-multiparty');
const fs = require('fs');
const aws = require('aws-sdk');
// const S3 = require('aws-sdk/clients/s3');

var {mongoose} = require('./db/mongoose');
// var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {Photo} = require('./models/photo');
var {Eventreg} = require('./models/eventreg');
var {Invitation} = require('./models/invitation');
var {Futurecamp} = require('./models/futurecamp');
// var {Game} = require('./models/game');
var {Familytree} = require('./models/familytree');
var {Family} = require('./models/family');
var {authenticate} = require('./middleware/authenticate');
var routes = require('./routes/index');
var todos = require('./routes/todos');
var games = require('./routes/games');
var eventregs = require('./routes/eventregs');
// multipartyMiddleware = multiparty();
aws.config.region = 'eu-west-2';
const S3_BUCKET = process.env.S3_BUCKET;

const publicPath = path.join(__dirname, '../public');
var app = express();
const port = process.env.PORT;

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));

app.use('/', routes);
app.use('/todos', todos);
app.use('/games', games);
app.use('/eventregs', eventregs);

// Get signed url for S3 operations
app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file_name'];
  const fileType = req.query['file_type'];
  const folder = req.query['folder'];
  const operation = req.query['operation'];
  
  // console.log(`Folder: ${folder} File: ${fileName} ${fileType}, Operation: ${operation}`)
  // console.log(process.env.AWS_ACCESS_KEY_ID);
  // console.log(process.env.AWS_SECRET_ACCESS_KEY);
  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName,
    Expires: 60,
    ContentType: fileType,
    StorageClass: 'REDUCED_REDUNDANCY'
  };

  s3.getSignedUrl(operation, s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

app.get('/sign-s3-getimage', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file_name'];
  const fileType = req.query['file_type'];
  const folder = req.query['folder'];
  const operation = req.query['operation'];
  
  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName,
    Expires: 1800
  };

  s3.getSignedUrl(operation, s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

app.get('/sign-s3-deleteimage', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file_name'];
  const fileType = req.query['file_type'];
  const folder = req.query['folder'];
  const operation = req.query['operation'];
  
  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName,
    Expires: 60
  };

  s3.getSignedUrl(operation, s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

// Event Registration section
/* 
app.post('/eventreg', authenticate, (req, res) => {
  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  var eventreg = new Eventreg({
    name: req.body.name,
    agegroup: req.body.agegroup,
    year: req.body.year,
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
});

// Get all event registrations for all years submitted by a specific member
app.get('/eventreg', authenticate, (req, res) => {
  Eventreg.find({
    _creator: req.user._id
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one year submitted by a specific member
app.get('/eventreg/:year', authenticate, (req, res) => {
  var year = req.params.year;
  Eventreg.find({
    _creator: req.user._id,
    year: year
  }).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for all years
app.get('/eventreg/all', (req, res) => {
  Eventreg.find({}).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Get all event registrations for one year
app.get('/eventreg/all/year/:year', (req, res) => {
  var year = req.params.year;
  Eventreg.find({year: year}).then((eventregs) => {
    res.json(eventregs);
  }, (e) => {
    res.status(400).send(e);
  });
});

// The creator of an event registration deletes the registration
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

// The admin or organizer deletes the registration
app.delete('/eventreg/admin/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (req.user.role < 2) {
    Eventreg.findOneAndRemove({
      _id: id
    }).then((eventreg) => {
      if (!eventreg) {
        return res.status(404).send();
      }
  
      res.json(eventreg);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };

});
 */
// Todo Section
/* 
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    category: req.body.category,
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
  Todo.find({}).then((todos) => {
    res.json(todos);
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
    _id: id
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
    _id: id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.json(todo);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['category', 'text', 'completed']);
  // console.log(`Patching tod, category: ${body.category}, Text: ${body.text}, Completed? ${body.completed}`);

  var uploader = req.user.name.firstname;
  if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
  uploader = uploader + ' ' + req.user.name.surname;
  body.completedBy = uploader;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
    body.completedBy = null;
  }

  Todo.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.json(todo);
  }).catch((e) => {
    res.status(400).send();
  })
});
 */

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'confirmpwd', 'role', 'name', 'address', 'phone', 'secret']);
  // console.log(`Email: ${body.email}, Name: ${body.name.firstname} ${body.name.middlename} ${body.name.surname}`);
  // console.log(`Secret and passwords: ${body.secret}, ${body.password}, ${body.confirmpwd}, ${body.role}`);
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

// Change role
app.patch('/users/role/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['role']);
  // console.log(`Status: ${body.role}`);
  User.findOneAndUpdate({_id: id}, {$set: {'role': body.role}}, {new: true}).then((user) => {
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
app.post('/users/me/password', authenticate, (req, res) => {
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
app.post('/users/password/:id', authenticate, (req, res) => {
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

app.get('/users', authenticate, (req, res) => {
  if (req.user.role < 2) {
    User.find({}).then((users) => {
      res.json(users);
    }, (e) => {
      res.status(400).send(e);
    });
  } else {
    res.status(401).send();
  };
});

app.get('/users/:id', authenticate, (req, res) => {
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

app.get('/userscount', (req, res) => {
  User.find({}).count().then((count) => {
    // console.log(`Number of users: ${count}`);
    res.json(count);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.delete('/users/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(id);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
    // console.log('ID not accepted');
  };

  if (req.user._id == id) {console.log('You cannot delete yourself');};

  if (req.user.role == 0 && req.user._id != id) {
    User.findOneAndRemove({
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

// Photos
app.post('/photos/upload', authenticate, (req, res) => {
  // console.log(req.body.text);
  var fn = req.body.filename;

  Photo.findOne({
    filename: fn
  }).then((photo) => {
    if (!photo) {
      var uploader = req.user.name.firstname;
      if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
      uploader = uploader + ' ' + req.user.name.surname;
      var photo = new Photo({
        _creator: req.body.user,
        year: req.body.year,
        filename: fn,
        filetype: req.body.filetype,
        path: 'images/' + req.body.year + '/',
        uploader: uploader,
        imagetext: [
          {
            textobj: {
              date: new Date(),
              contributor: uploader,
              text: req.body.text
            }
          }
        ]
      });

      photo.save().then((doc) => {
        res.send(doc);
      }, (e) => {
        res.status(400).send(e);
      });

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
    
});

app.get('/photos/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  console.log(`Photos, year: ${year}`);
  Photo.find({
    year: year
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/photos/my', authenticate, (req, res) => {
  console.log(`My photos, user: ${req.user._id}`);
  Photo.find({
    _creator: req.user._id
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/photos/my/:year', authenticate, (req, res) => {
  var year = req.params.year;
  console.log(`My photos year ${year}, user: ${req.user._id}`);
  Photo.find({
    _creator: req.user._id, year: year
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
});

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

    // console.log(`Image ${photo.filename} removed`);
    res.json(photo);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/photos/admindelete/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (req.user.role == 0) {
    Photo.findOneAndRemove({
      _id: id
    }).then((photo) => {
      if (!photo) {
        return res.status(404).send();
      }
  
      console.log(`Image ${photo.filename} removed`);
      res.json(photo);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };

});

app.patch('/photos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  console.log(`Comment: ${req.body.text}`);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  var uploader = req.user.name.firstname;
  if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
  uploader = uploader + ' ' + req.user.name.surname;

  var newtextobj = {
    textobj: {
      date: new Date(),
      contributor: uploader,
      text: req.body.text
    }
  };

  Photo.findOneAndUpdate({_id: id}, {$push: {'imagetext': newtextobj}}, {new: true}).then((photo) => {
    if (!photo) {
      console.log(`Photo not found`);
      return res.status(404).send();
    }

    res.send({photo});
  }).catch((e) => {
    res.status(400).send();
  });
});

// Invitations
app.post('/invitations', authenticate, (req, res) => {
  var invitation = new Invitation({
    headline: req.body.headline,
    year: req.body.year,
    text1: req.body.text1,
    camp: req.body.camp,
    address: req.body.address,
    startdate: req.body.startdate,
    starttime: req.body.starttime,
    enddate: req.body.enddate,
    endtime: req.body.endtime,
    registration: req.body.registration,
    bring: req.body.bring,
    payment: req.body.payment,
    text2: req.body.text2,
    organizers: req.body.organizers,
    _creator: req.user._id
  });

  invitation.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    console.log('POST invitation error');
    res.status(400).send(e);
  });
});

app.get('/invitations/:year', authenticate, (req, res) => {
  var year = req.params.year;
  Invitation.findOne({
    year: year
  }).then((invitation) => {
    res.json(invitation);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/invitations', authenticate, (req, res) => {
  Invitation.find({}).then((invitations) => {
    res.json(invitations);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.patch('/invitations/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['headline', 'year', 'text1', 'camp', 'address', 'startdate', 'starttime', 'enddate', 'endtime', 'registration', 'bring', 'payment', 'text2', 'organizers']);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  Invitation.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((invitation) => {
    if (!invitation) {
      console.log(`Invitation not found`);
      return res.status(404).send();
    }

    res.send({invitation});
  }).catch((e) => {
    res.status(400).send();
  })
});

// Future camps
app.post('/futurecamps', authenticate, (req, res) => {
  var futurecamp = new Futurecamp({
    year: req.body.year,
    camp: req.body.camp,
    address: req.body.address,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    organizers: req.body.organizers,
    committees: req.body.committees,
    _creator: req.user._id
  });

  futurecamp.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/futurecamps', authenticate, (req, res) => {
  Futurecamp.find({}).then((futurecamps) => {
    res.json(futurecamps);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/futurecamps/gtyear/:year', authenticate, (req, res) => {
  var year = req.params.year;
  Futurecamp.find({'year':{'$gt':year}}).then((futurecamps) => {
    res.json(futurecamps);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/futurecamps/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log('This is the findById section');

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
    console.log('Invalid Id');
  }

  Futurecamp.findById(id).then((futurecamp) => {
    if (!futurecamp) {
      return res.status(404).send();
    }

    res.send({futurecamp});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/futurecamps/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log('This is the find by Year section');

  Futurecamp.findOne({
    year: year
  }).then((futurecamp) => {
    if (!futurecamp) {
      return res.status(404).send();
    }

    res.send({futurecamp});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/futurecamps/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['year', 'camp', 'address', 'startdate', 'enddate', 'organizers', 'committees']);

  if (!ObjectID.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  }

  Futurecamp.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((futurecamp) => {
    if (!futurecamp) {
      console.log(`Futurecamp not found`);
      return res.status(404).send();
    }

    res.send({futurecamp});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.delete('/futurecamps/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Futurecamp.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((futurecamp) => {
    if (!futurecamp) {
      return res.status(404).send();
    }

    res.json(futurecamp);
  }).catch((e) => {
    res.status(400).send();
  });
});

// Games Section
/* 
app.post('/games', authenticate, (req, res) => {
  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  var game = new Game({
    name: req.body.name,
    description: req.body.description,
    _creator: req.user._id,
    createdBy: registeree
  });

  game.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/games', authenticate, (req, res) => {
  Game.find({}).then((games) => {
    res.json(games);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/games/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOne({
    _id: id
  }).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.send({game});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/games/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOneAndRemove({
    _id: id
  }).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.json(game);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/games/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'description']);
  // console.log(`Patching game, category: ${body.name}, Description: ${body.description}`);

  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  body.createdBy = registeree;
  body._creator = req.user._id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.json(game);
  }).catch((e) => {
    res.status(400).send();
  })
});
 */
// Family Section
app.post('/families', authenticate, (req, res) => {

  console.log(`admin_id: ${req.body._admin}, _kid: ${req.body._kid}, klan: ${req.body.klan}, parent_id: ${req.body._parent_id}, family_id: ${req.body._family_id}, ${req.body.persons[0].firstname}`);

  if (!ObjectID.isValid(req.body._admin)) {
    console.log(`Admin ID not valid: ${req.body._admin}`);
    // return res.status(404).send();
  }

  var family = new Family({
    _admin: req.body._admin,
    level: req.body.level,
    klan: req.body.klan,
    _kid: req.body._kid,
    _parent_id: req.body._parent_id,
    _family_id: req.body._family_id,
    persons: req.body.persons
  });

  family.save().then((family) => {
    res.json(family);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/families/:level', authenticate, (req, res) => {
  var level = req.params.level;
  // console.log(`Klan: ${klan}`);

  Family.find({
    level: level
  }).then((families) => {
    if (!families) {
      return res.status(404).send();
    }

    res.json(families);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/familiesforparent/:level', authenticate, (req, res) => {
  var level = req.params.level;
  // console.log(`Klan: ${klan}`);

  Family.find({
    level: level,
    _parent_id: req.body._parent_id
  }).then((families) => {
    if (!families) {
      return res.status(404).send();
    }

    res.json(families);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/familiesinklan/:level', authenticate, (req, res) => {
  var level = req.params.level;
  var parent_id = req.body._parent_id;
  console.log(`Parent_id: ${parent_id}`);
  switch (level) {
    case 0:
      var pattern = {"chain.l0": req.body._parent_id}
    case 1:
      var pattern = {"chain.l1": req.body._parent_id}
    case 2:
      var pattern = {"chain.l2": req.body._parent_id}
    case 3:
      var pattern = {"chain.l3": req.body._parent_id}
    case 4:
      var pattern = {"chain.l4": req.body._parent_id}
    case 5:
      var pattern = {"chain.l5": req.body._parent_id}
  }

  Family.find(pattern).then((families) => {
    if (!families) {
      return res.status(404).send();
    }

    res.json(families);
  }).catch((e) => {
    res.status(400).send();
  });
});

app.get('/familiescount/:level', authenticate, (req, res) => {
  var level = req.params.level;
  Family.find({level:level}).count().then((count) => {
    // console.log(`Number of users: ${count}`);
    res.json(count);
  }, (e) => {
    res.status(400).send(e);
  });
});


// Familytree section
app.post('/familytree', authenticate, (req, res) => {
  // console.log(`admin: ${req.body._admin}, level: ${req.body.level}, parent: ${req.body._parent_id}, family: ${req.body._family_id}, klan: ${req.body.klan}, _kid: ${req.body._kid}, ${req.body.persons[0].firstname}`);

  if (!ObjectID.isValid(req.body._admin)) {
    console.log(`Admin ID not valid: ${req.body._admin}`);
    // return res.status(404).send();
  }

  var familytree = new Familytree({
    _admin: req.body._admin,
    level: req.body.level,
    klan: req.body.klan,
    _kid: req.body._kid,
    _parent_id: req.body._parent_id,
    _family_id: req.body._family_id,
    persons: req.body.persons
  });

  familytree.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/familytree', authenticate, (req, res) => {
  Familytree.find({}).then((familytrees) => {
    // console.log(`Familytree: ${familytrees[0]}`);
    res.json(familytrees);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/familytree/:level', authenticate, (req, res) => {
  var level = req.params.level;
  // console.log(`Klan: ${klan}`);

  Familytree.find({
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

app.get('/familytree/parent/:parent_id', authenticate, (req, res) => {
  var _parent_id = req.params.parent_id;
  // console.log(`Klan: ${klan}`);

  Familytree.find({
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

app.patch('/familytree/:id', authenticate, (req, res) => {
  var id = req.params.id;
  console.log(`id: ${id}`);

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

app.patch('/familytree/l2/:id', authenticate, (req, res) => {
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

app.patch('/familytree/edit/:id', authenticate, (req, res) => {
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

app.patch('/familytree/delete/:id', authenticate, (req, res) => {
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

app.delete('/familytree/:id', authenticate, (req, res) => {
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


app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};

/* 
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
 */
