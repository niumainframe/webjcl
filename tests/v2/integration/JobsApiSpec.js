'use strict';
var root = '../../..';

var http = require('http');
var express = require('express');
var Q = require('q');
var frisby = require('frisby');

var WebJclApi = require(root + '/http/JobsApi.js');
var JobController = require(root + '/framework/JobController.js');
var Job = require(root + '/models/Job.js');
var middleware = require(root + '/middleware');

frisby.globalSetup({ timeout: 10000 });

describe('WebJCL Jobs API', function () {
    
    var server, app, webJclApi, jobController;
    
    // Test Parameters
    var expressPort = 30023;
    var host = 'http://localhost:' + expressPort;
    var creds = { user: 'goodUser', pass: 'goodPass' };
    var resultingJob = new Job({
            id: 'ABC-123',
            user: creds.user,
            body: "//" + creds.user + "A JOB ,'CSCI360',MSGCLASS=H",
            output: '[PROCESSED] testJob',
            date: new Date(2042, 10, 1, 9, 29, 0)
    });
    
    beforeEach(function (done) {
        
        // Have jobController.submitJob resolve a mocked job
        var deferred = Q.defer();
        deferred.resolve(resultingJob);
        
        jobController = Object.create(JobController.prototype);
        spyOn(jobController, 'submitJob')
            .andReturn(deferred.promise);
        
        // Assemble the WebJCL Api
        webJclApi = WebJclApi({
           jobController : jobController,
           authenticator : express.basicAuth(creds.user, creds.pass)
        });
        
        // Mount the Api to an express app and start server.
        app = express().use('/', webJclApi);
        server = http.createServer(app).listen(expressPort, function () {
            done();
        });
    });
    
    afterEach(function (done) {
        server.close(function () {
            done();
        });
    });
    
    frisby.create('Retrieving a saved job') 
        .get(host + '/jobs/fakeid', {
            auth: { user: creds.user, pass: creds.pass }
        })
        .expectStatus(200)
        .toss();
    
    frisby.create('Job listing')
        .get(host + '/jobs', {
            auth: { user: creds.user, pass: creds.pass }
        })
        .expectStatus(200)
        .toss();
        
    describe('Posting a job', function () {
        
        var payload = resultingJob.body;
        
        describe('with good credentials', function () {
            
            var postFrisby = frisby.create('should succeed')
                .post(host + '/jobs', null, {
                    headers: {
                        'content-type': 'text/plain'
                    },
                    body: payload,
                    auth: { user: creds.user, pass: creds.pass }
                })
                .expectStatus(200)
                .expectJSON({
                    id: resultingJob.id,
                    body: resultingJob.body,
                    output: resultingJob.output,
                    user: resultingJob.user,
                    date: function(v) {
                        expect(new Date(v).getTime())
                            .toEqual(resultingJob.date.getTime());
                    }
                })
                .expectHeaderContains('Last-Modified', 'Sat, 01 Nov 2042 14:29:00 GMT');
                
                postFrisby.current.expects.push(function(){
                    expect(jobController.submitJob)
                        .toHaveBeenCalledWith(payload, creds.user, creds.pass);
                });
                
                postFrisby.toss();
        });
            
        describe('with bad credentials', function () {
            
            frisby.create('should return unauthorized')
                .post(host + '/jobs', null, {
                    auth: { user: creds.user+'bad', pass: creds.pass }
                })
                .expectStatus(401)
                .inspectBody()
                .toss();
        });
    });
});
