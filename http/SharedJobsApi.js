var root = '..'
var express = require('express');
var textBody = require('body');

var middleware = require(root + '/util/middleware.js');

/**
 * SharedJobsApi
 * 
 * @returns express.js application
 * 
 * @param config object
 *  jobController
 *      Instance of the jobController
 *  authenticator
 *      Middleware which will parse HTTP basic auth.
 */
function SharedJobsApi(config) {
    
    var jobController = config.jobController || 
        console.warn('SharedJobsApi needs jobController');
        
    var app = express();

    app.use(middleware.textBodyParser);

    app.post('/', function (req, res) {
        
        if(!req.is('text/plain')) {
            res.send(415, "This only accepts 'text/plain'");
            return;
        }

        jobController
            .saveJob(JSON.parse(req.body))
            .then(function (job) {
                res.send(job);
            }, function(err) {
                res.send(err, 400);
            });
    });

    app.get('/:id', function (req, res) {
        console.log
        jobController
            .getJobById(req.params['id'])
            .then(function(job) {
                res.send(job);
            });
    });
    
    return app;
}




module.exports = SharedJobsApi
