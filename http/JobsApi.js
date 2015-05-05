var root = '..'
var express = require('express');
var textBody = require('body');

var middleware = require(root + '/util/middleware.js');

/**
 * JobsApi
 * 
 * @returns express.js application
 * 
 * @param config object
 *  jobController
 *      Instance of the jobController
 *  authenticator
 *      Middleware which will parse HTTP basic auth.
 */
function JobsApi(config) {
    
    var jobController = config.jobController || 
        console.warn('JobsApi needs jobController');
    var authenticator = config.authenticator ||
        console.warn('JobsApi needs authenticator');
        
    var app = express();
    

    app.use(config.authenticator);
    app.use(middleware.textBodyParser);
    
    app.get('/', function (req, res) {
        
        jobController
            .listJobs(req.user)
            .then(function (jobs) {
                res.send(jobs);
            });;
    });

    app.post('/', function (req, res) {
        
            if(!req.is('text/plain')) {
                res.send(415, "This only accepts 'text/plain'");
                return;
            }
        
            jobController
                .submitJob(req.body, req.user, req.auth.password)
                .then(function (job) {
                    res.set('last-modified', job.date.toUTCString());
                    res.send(job);
                }, function(err) {
                    res.send(err, 400);
                });
    });

    app.get('/:id', function (req, res) {
        
        jobController
            .getJobById(req.params['id'])
            .then(function(job) {
                res.send(job);
            });
    });
    
    return app;
}




module.exports = JobsApi
