var http  = require('http');
var express = require('express');
var config = require('./config.js');

//-- WebJCL Jobs API ---------------------------------------------------------
var JobController = require('./framework/JobController');
var JobRepository = require('./framework/JobRepository');
var JclProcessor = require('./framework/JclProcessor');
var FtpBasicAuth = require('./middleware.js').FtpBasicAuth('localhost', '2121');

var jobRepository = new JobRepository();
var jclProcessor = new JclProcessor();

var jobController = new JobController({
    jobRepository: jobRepository,
    jclProcessor: jclProcessor
});

var jobsApi = require('./http/JobsApi.js')({
    jobController: jobController,
    authenticator: FtpBasicAuth
});
//-----------------------------------------------------------------------


//---- Site Mounts -------------------------------------------------------
var site = express();

site.use('/webjcl/v2', jobsApi); 

// Default action
site.use('/', function (req, res) {
    res.send(404);
});
//-----------------------------------------------------------------------


// Start HTTP server
var server = http.createServer(site).listen(config.port);
