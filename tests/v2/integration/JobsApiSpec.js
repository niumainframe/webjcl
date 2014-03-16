'use strict';
var root = '../../..';

var http = require('http');
var express = require('express');
var Q = require('q');
var frisby = require('frisby');

var WebJclApi = require(root + '/http/JobsApi.js');
var JobController = require(root + '/framework/JobController.js');
var Job = require(root + '/models/Job.js');
var middleware = require(root + '/util/middleware');

frisby.globalSetup({ timeout: 10000 });

describe('WebJCL Jobs API', function () {
    
    var server, app, webJclApi, jobController;
    
    // Test Parameters
    var expressPort = 30023;
    var host = 'http://localhost:' + expressPort;
    var creds = { user: 'goodUser', pass: 'goodPass' };
    
    /* * * * * * * *
     * TEST DATA
     */
    var testJob = new Job({
            id: 'ABC-123',
            user: creds.user,
            body: "//" + creds.user + "A JOB ,'CSCI360',MSGCLASS=H",
            output: '[PROCESSED] testJob',
            date: new Date(2042, 10, 1, 9, 29, 0)
    });
    
    var testJobList = [testJob];
    
    var jobJsonVerifier = {
        id: testJob.id,
        body: testJob.body,
        output: testJob.output,
        user: testJob.user,
        date: function(v) {
            expect(new Date(v).getTime())
                .toEqual(testJob.date.getTime());
        }
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * **/
    
    beforeEach(function () {
        
        jobController = Object.create(JobController.prototype);
        
        // Have jobController.listJobs resolve a mocked job list
        var deferred = Q.defer();
        deferred.resolve(testJobList);
        spyOn(jobController, 'listJobs')
            .andReturn(deferred.promise);
            
        // Have jobController.getJobById resolve a mocked job
        deferred = Q.defer();
        deferred.resolve(testJob);
        spyOn(jobController, 'getJobById')
            .andReturn(deferred.promise);
        
    });
    
    afterEach(function (done) {
        server.close(function () {
            done();
        });
    });
    
    var act = function (done) {
        
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
    }
    
    describe('Retrieving a saved job', function () {
        
        var testId = 'abcd-12345';
        
        beforeEach(function (done) {
            act(done);
        });
        
        var retrFrisby = frisby.create('with good credentials') 
            .get(host + '/jobs/' + testId, {
                auth: { user: creds.user, pass: creds.pass }
            })
            .expectStatus(200)
            .expectJSON(jobJsonVerifier);
            
        retrFrisby.current.expects.push(function () {
            expect(jobController.getJobById)
                .toHaveBeenCalledWith(testId);
        });
        
        retrFrisby.toss();
        
        //------
        frisby.create('with bad credentials')
            .get(host + '/jobs', {
                auth: { user: creds.user+'bad', pass: creds.pass }
            })
            .expectStatus(401)
            .toss();
    });

    
    describe('Job listing', function () {
        
        beforeEach(function (done) {
            act(done);
        });
        
        var listFrisby = frisby.create('with good credentials')
            .get(host + '/jobs', {
                auth: { user: creds.user, pass: creds.pass }
            })
            .expectStatus(200)
            .expectJSON('*', jobJsonVerifier)
            listFrisby.current.expects.push(function () {
                expect(jobController.listJobs)
                    .toHaveBeenCalledWith(creds.user);
            });
            
            listFrisby.toss();
        
        frisby.create('with bad credentials')
            .get(host + '/jobs', {
                auth: { user: creds.user+'bad', pass: creds.pass }
            })
            .expectStatus(401)
            .toss();
    });

        
    describe('Posting a job', function (done) {
        var submitJobDeferred;
        var payload = testJob.body;
        
        beforeEach(function () {
            
            // Have jobController.submitJob return a deferred promise.
            submitJobDeferred = Q.defer();
            spyOn(jobController, 'submitJob')
                .andReturn(submitJobDeferred.promise);
        });
        
        describe('irregardless of job success', function () {
            beforeEach(function (done) {
                act(done);
            });
            
            frisby.create('with bad credentials should fail')
                .post(host + '/jobs', null, {
                    auth: { user: creds.user+'bad', pass: creds.pass }
                })
                .expectStatus(401)
                .toss();
                
            frisby.create('Non text/plain content-type should fail')
                .post(host + '/jobs', null, {
                    body: payload,
                    headers: {
                        'content-type': 'application/json'
                    },
                    auth: { user: creds.user, pass: creds.pass }
                })
                .expectStatus(415) //Unsupported Media Type
                .toss();
            
        });
        
        describe('when the job successfully processes', function () {
            beforeEach(function (done) {
                
                submitJobDeferred.resolve(testJob);
                
                act(done);
            });
            
            var postFrisby = frisby.create('submit job')
                .post(host + '/jobs', null, {
                    headers: {
                        'content-type': 'text/plain'
                    },
                    body: testJob.body,
                    auth: { user: creds.user, pass: creds.pass }
                })
                .expectStatus(200)
                .expectJSON(jobJsonVerifier)
                .expectHeaderContains('Last-Modified', testJob.date.toGMTString());
                
                postFrisby.current.expects.push(function(){
                    expect(jobController.submitJob)
                        .toHaveBeenCalledWith(payload, creds.user, creds.pass);
                });
                
                postFrisby.toss();
            
        });
        
        describe('when the job unsuccessfully processes', function () {
            
            beforeEach(function (done) {
                submitJobDeferred.reject('Its an error');
                //submitJobDeferred.reject('There was an error...');
                act(done);
            });
            
            
            var postFrisby = frisby.create('submit job')
                .post(host + '/jobs', null, {
                    headers: {
                        'content-type': 'text/plain'
                    },
                    body: testJob.body,
                    auth: { user: creds.user, pass: creds.pass }
                })
                .expectHeaderContains('content-type', 'text/html')
                .expectStatus(400)
                
                postFrisby.current.expects.push(function(){
                    expect(jobController.submitJob)
                        .toHaveBeenCalledWith(payload, creds.user, creds.pass);
                });
                
                postFrisby.toss();
            
            
        });

        

    });
});
