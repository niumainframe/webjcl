var root = '..'
var express = require('express');
var textBody = require('body');

var middleware = require(root + '/middleware.js');

/**
 * WebJclApiFactory
 * 
 * @returns express.js application
 * 
 * @param config object
 *  jobController
 *      Instance of the jobController
 *  authenticator
 *      Middleware which will parse HTTP basic auth.
 */
function WebJclApiFactory(config) {
    
    var jobController = config.jobController;
    var WebJclApi = express();
    

    WebJclApi.use(config.authenticator);
    WebJclApi.use(middleware.textBodyParser);
    
    WebJclApi.get('/jobs', function (req, res) {
        
        jobController
            .listJobs(req.user)
            .then(function (jobs) {
                res.send(jobs);
            });;
    });

    WebJclApi.post('/jobs', function (req, res) {
            
            jobController
                .submitJob(req.body, req.user, req.auth.password)
                .then(function (job) {
                    res.set('last-modified', job.date.toUTCString());
                    res.send(job);
                });
    });

    WebJclApi.get('/jobs/:id', function (req, res) {
        
        jobController
            .getJobById(req.params['id'])
            .then(function(job) {
                res.send(job);
            });
    });
    
    return WebJclApi;
}




module.exports = WebJclApiFactory
