var express = require('express');
var jobsApi = require('./JobsApi');
var sharedJobsApi = require('./SharedJobsApi');

//---- WebJCL Production API ------------------------------------------
var WebJCLExpressApp = express();
var client = express.static('client');

// Jobs API
WebJCLExpressApp.use('/webjcl/v2/jobs', jobsApi); 

// SharedJobs API
WebJCLExpressApp.use('/webjcl/v2/shared-jobs', sharedJobsApi); 

// Serve static files out of /client folder.
WebJCLExpressApp.use(client);

// Default action
WebJCLExpressApp.use('/', function (req, res) {
    res.send(404);
});
//---------------------------------------------------------------------

module.exports = WebJCLExpressApp;
