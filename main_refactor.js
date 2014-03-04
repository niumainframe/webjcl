var http  = require('http');
var https = require('https');
var express = require('express');
var fs = require('fs');
//var mongo = require('./mongo.js');
//var Authenticator = require('./Authenticator');
var package = require('./package.json');
var config = require('./config.js');

//-- WebJCL API ---------------------------------------------------------
var JobController = require('./framework/JobController.js');
var JobsApi = require('./http/JobsApi.js')({
    jobController: new JobController()
});
//-----------------------------------------------------------------------


//---- Site Mounts -------------------------------------------------------
var site = express();

site.use('/webjcl/v1', JobsApi);  

// Default action
site.use('/', function (req, res) {
    res.send(404);
});
//-----------------------------------------------------------------------


// Start HTTP server
var server = http.createServer(site).listen(config.port);
