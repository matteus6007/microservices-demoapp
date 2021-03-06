const express = require('express');
const routes = express.Router();
const uuidv4 = require('uuid/v4');
const os = require('os');
const fs = require('fs');

var dataAccess = require('../lib/data-access');

// Admin and db maintenance routes

routes
.post('/api/dbinit', function (req, res, next) {
  // Secret key in held in header called X-SECRET
  let secretValue = req.headers['x-secret'];
  let secret = process.env.DBINIT_SECRET || "123secret!";

  if(!secretValue) {
    res.status(401).send({msg: "Error! Secret not supplied. Please provide the secret in the X-SECRET header"});
    return;
  }
  if(secretValue != secret) {
    res.status(401).send({msg: "Error! Secret is incorrect"});
    return;
  }

  res.type('application/json');
  dataAccess.initDatabase()
    .then(d => res.send(d))
    .catch(e => res.status(400).send(e));  
})

.get('/api/info', function (req, res, next) {
  res.type('application/json');
  var info = { 
    hostname: os.hostname(), 
    container: fs.existsSync('/.dockerenv'), 
    osType: os.type(), 
    osRelease: os.release(), 
    arch: os.arch(),
    cpuModel: os.cpus()[0].model, 
    cpuCount: os.cpus().length, 
    memory: Math.round(os.totalmem() / 1048576),
    nodeVer: process.version,
    cosmosDb: dataAccess.getCosmosInfo()
  }  
  res.send(info);
})

// Global catch all for all requests not caught by other routes
// Just return a HTTP 400
.get('*', function (req, res, next) {
  res.sendStatus(400);
})

module.exports = routes;
