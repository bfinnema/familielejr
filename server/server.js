require('./config/config');

const _ = require('lodash');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
// const {ObjectId} = require('mongodb');
// const fs = require('fs');
// const aws = require('aws-sdk');
// const S3 = require('aws-sdk/clients/s3');

var {mongoose} = require('./db/mongoose');
var {authenticate} = require('./middleware/authenticate');
var routes = require('./routes/index');
var todos = require('./routes/todos');
var games = require('./routes/games');
var eventregs = require('./routes/eventregs');
var users = require('./routes/users');
var photos = require('./routes/photos');
var familytrees = require('./routes/familytrees');
var expenses = require('./routes/expenses');
var incomes = require('./routes/incomes');
var fiscalyears = require('./routes/fiscalyears');
var docs = require('./routes/docs');
var nonactiveusers = require('./routes/nonactiveusers');
var groceries = require('./routes/groceries');
var summaries = require('./routes/summaries');
var tenants = require('./routes/tenants');
var abouts = require('./routes/abouts');
var eventtypes = require('./routes/eventtypes');
var events = require('./routes/events');

// aws.config.region = 'eu-west-2';
// const S3_BUCKET = process.env.S3_BUCKET;

const publicPath = path.join(__dirname, '../public');
var app = express();
const port = process.env.PORT;

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));

// app.use('/', routes);
app.use('/todos', todos);
app.use('/games', games);
app.use('/eventregs', eventregs);
app.use('/users', users);
app.use('/photos', photos);
app.use('/familytrees', familytrees);
app.use('/expenses', expenses);
app.use('/incomes', incomes);
app.use('/fiscalyears', fiscalyears);
app.use('/docs', docs);
app.use('/nonactiveusers', nonactiveusers);
app.use('/groceries', groceries);
app.use('/summaries', summaries);
app.use('/tenants', tenants);
app.use('/abouts', abouts);
app.use('/eventtypes', eventtypes);
app.use('/events', events);

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
