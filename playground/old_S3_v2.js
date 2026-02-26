const {ObjectId} = require('mongodb');
const _ = require('lodash');
// const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
// const aws = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

var {Photo} = require('../models/photo');
var {authenticate} = require('../middleware/authenticate');

aws.config.region = 'eu-west-2';
const S3_BUCKET = process.env.S3_BUCKET;

router.get('/s3ops/sign-s3', authenticate, (req, res) => {
  console.log(`In sign-s3. fileName: ${req.query['file_name']}`);
  const s3 = new aws.S3();
  const fileName = req.query['file_name'];
  const fileType = req.query['file_type'];
  const folder = req.query['folder'];
  const operation = req.query['operation'];
  
  console.log(`Folder: ${folder} File: ${fileName} ${fileType}, Operation: ${operation}`)
  console.log(process.env.AWS_ACCESS_KEY_ID);
  console.log(process.env.AWS_SECRET_ACCESS_KEY);
  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName,
    Expires: 60,
    ContentType: fileType,
    StorageClass: 'STANDARD_IA'
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

router.get('/s3ops/sign-s3-getimage', authenticate, (req, res) => {
  console.log(`In sign-s3-getimage. fileName: ${req.query['file_name']}`);
  const s3 = new aws.S3();
  const fileName = req.query['file_name'];
  const fileType = req.query['file_type'];
  const folder = req.query['folder'];
  const operation = req.query['operation'];

  console.log(`File name: ${fileName}, fileType: ${fileType}, folder: ${folder}, operation: ${operation}`);
  console.log(`S3_BUCKET: ${S3_BUCKET}`);
  
  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName,
    Expires: 1800
  };

  console.log(`Key in s3Params: ${s3Params.Key}`);

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

router.get('/s3ops/sign-s3-deleteimage', authenticate, (req, res) => {
  // console.log(`In sign-s3-deleteimage. fileName: ${req.query['file_name']}`);
  const s3 = new aws.S3();
  const fileName = req.query['file_name'];
  const fileType = req.query['file_type'];
  const folder = req.query['folder'];
  const operation = req.query['operation'];

  // console.log(`File name: ${fileName}, fileType: ${fileType}, folder: ${folder}, operation: ${operation}`);
  // console.log(`S3_BUCKET: ${S3_BUCKET}`);

  const albumPhotosKey = encodeURIComponent(folder) + '/';
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: albumPhotosKey + fileName,
    Expires: 60
  };

  // console.log(`Key in s3Params: ${s3Params.Key}`);

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
