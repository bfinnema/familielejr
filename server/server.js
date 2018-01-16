require('./config/config');

const _ = require('lodash');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const fs = require('fs');
const aws = require('aws-sdk');
// const S3 = require('aws-sdk/clients/s3');

var {mongoose} = require('./db/mongoose');
var {authenticate} = require('./middleware/authenticate');
var routes = require('./routes/index');
var todos = require('./routes/todos');
var games = require('./routes/games');
var eventregs = require('./routes/eventregs');
var users = require('./routes/users');
var photos = require('./routes/photos');
var invitations = require('./routes/invitations');
var futurecamps = require('./routes/futurecamps');
var familytrees = require('./routes/familytrees');

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
app.use('/users', users);
app.use('/photos', photos);
app.use('/invitations', invitations);
app.use('/futurecamps', futurecamps);
app.use('/familytrees', familytrees);

// Get signed url for S3 operations
/* 
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
 */

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
