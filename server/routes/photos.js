const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

var {Photo} = require('../models/photo');
var {authenticate} = require('../middleware/authenticate');

const S3_BUCKET = process.env.S3_BUCKET;
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2'
});

function getS3Command(operation, params) {
  if (operation === 'putObject') {
    return new PutObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      StorageClass: 'STANDARD_IA'
    });
  }

  if (operation === 'getObject') {
    return new GetObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key
    });
  }

  if (operation === 'deleteObject') {
    return new DeleteObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key
    });
  }

  throw new Error(`Unsupported S3 operation: ${operation}`);
}

router.post('/upload', authenticate, (req, res) => {
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
        _tenant: req.user._tenant,
        _event: req.body._event,
        eventName: req.body.eventName,
        filename: fn,
        commonImage: req.body.commonImage,
        filetype: req.body.filetype,
        path: 'images/' + req.body.year + '/',
        uploader: uploader,
        orientation: req.body.orientation,
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

router.get('/year/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`Photos, year: ${year}`);
  Photo.find({
    year: year,
    _tenant: req.user._tenant
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/common', authenticate, (req, res) => {
  // console.log(`Photos, looking for common images.`);
  Photo.find({
    commonImage: true,
    _tenant: req.user._tenant
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`Photos, _id: ${id}`);

  if (!ObjectId.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  };

  Photo.findOne({
    _id: id,
    _tenant: req.user._tenant
  }).then((photo) => {
    res.json(photo);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/my', authenticate, (req, res) => {
  // console.log(`My photos, user: ${req.user._id}`);
  Photo.find({
    _creator: req.user._id
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/my/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`My photos year ${year}, user: ${req.user._id}`);
  Photo.find({
    _creator: req.user._id, year: year
  }).then((photos) => {
    res.json(photos);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/my/count/:year', authenticate, (req, res) => {
  var year = req.params.year;
  // console.log(`Count of my photos year ${year}, user: ${req.user._id}`);
  Photo.find({
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
  // console.log(`Count Photos year ${year}, user: ${req.user._id}`);
  Photo.find({
    year: year,
    _tenant: req.user._tenant
  }).countDocuments().then((count) => {
    var result = {"year":year,"count":count};
    res.json(result);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.delete('/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Photo.findOneAndDelete({
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

router.delete('/admindelete/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  if (req.user.role == 0) {
    Photo.findOneAndDelete({
      _id: id,
      _tenant: req.user._tenant
    }).then((photo) => {
      if (!photo) {
        return res.status(404).send();
      }
  
      // console.log(`Image ${photo.filename} removed`);
      res.json(photo);
    }).catch((e) => {
      res.status(400).send();
    });
  } else {
    res.status(401).send();
  };

});

router.patch('/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`Comment: ${req.body.text}`);

  if (!ObjectId.isValid(id)) {
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

  Photo.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$push: {'imagetext': newtextobj}}, {new: true}).then((photo) => {
    if (!photo) {
      console.log(`Photo not found`);
      return res.status(404).send();
    }

    res.send({photo});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/orientation/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // console.log(`Rotation: ${req.body.orientation}`);

  if (!ObjectId.isValid(id)) {
    console.log(`id is not valid`);
    return res.status(404).send();
  };

  Photo.findOneAndUpdate({_id: id, _tenant: req.user._tenant}, {$set: {'orientation': req.body.orientation}}).then((photo) => {
    if (!photo) {
      console.log(`Photo not found`);
      return res.status(404).send();
    }

    res.json(photo);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.get('/s3ops/sign-s3', authenticate, async (req, res) => {
  // console.log(`In sign-s3. fileName: ${req.query['file_name']}`);
  const fileName = req.query['file_name'];
  const fileType = req.query['file_type'];
  const folder = req.query['folder'];
  const operation = req.query['operation'];
  
  // console.log(`Folder: ${folder} File: ${fileName} ${fileType}, Operation: ${operation}`)
  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName,
    ContentType: fileType
  };

  try {
    const command = getS3Command(operation, s3Params);
    const signedRequest = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    const returnData = {
      signedRequest,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}`
    };
    res.json(returnData);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

router.get('/s3ops/sign-s3-getimage', authenticate, async (req, res) => {
  // console.log(`In sign-s3-getimage. fileName: ${req.query['file_name']}`);
  const fileName = req.query['file_name'];
  const folder = req.query['folder'];
  const operation = 'getObject';

  // console.log(`File name: ${fileName}, folder: ${folder}, operation: ${operation}`);
  // console.log(`S3_BUCKET: ${S3_BUCKET}`);
  
  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName
  };

  // console.log(`Key in s3Params: ${s3Params.Key}`);

  try {
    const command = getS3Command(operation, s3Params);
    const signedRequest = await getSignedUrl(s3Client, command, { expiresIn: 1800 });
    const returnData = {
      signedRequest,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}`
    };
    res.json(returnData);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

router.get('/s3ops/sign-s3-deleteimage', authenticate, async (req, res) => {
  // console.log(`In sign-s3-deleteimage. fileName: ${req.query['file_name']}`);
  const fileName = req.query['file_name'];
  const folder = req.query['folder'];
  const operation = 'deleteObject';

  // console.log(`File name: ${fileName}, fileType: ${fileType}, folder: ${folder}, operation: ${operation}`);
  // console.log(`S3_BUCKET: ${S3_BUCKET}`);

  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName
  };

  // console.log(`Key in s3Params: ${s3Params.Key}`);

  try {
    const command = getS3Command(operation, s3Params);
    const signedRequest = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    const returnData = {
      signedRequest,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${fileName}`
    };
    res.json(returnData);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

module.exports = router;
