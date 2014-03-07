'use strict';
var root = '../../..';

var JobRepository = require(root + '/framework/JobRepository.js');
var Job = require(root + '/models/Job');
var mongo = require(root + '/mongo');

describe('stuff', function () {

    var jobRepository, testJob;
    var jobIds = [];

    beforeEach(function () {
        testJob = new Job({
            id: null,
            user: 'testuser',
            body: 'testbody',
            output: 'processed testbody'
        });
        
        jobRepository = new JobRepository({
            mongoDb: mongo
        });
    });
    
    describe('Saving a job', function () {
        
        var jobResult;
        
        beforeEach(function (done) {
        
            jobRepository.saveJob(testJob)
                .then(function (job) {
                    
                    jobResult = job;
                    jobIds.push(job._id);
                    done();
                });
        });
        
        it('should have applied an id', function () {
            expect(jobResult.id).not.toBe(null);            
        });
        
        it('should return the saved job', function () {
            expect(jobResult.user).toBe(testJob.user);
            expect(jobResult.body).toBe(testJob.body);
            expect(jobResult.output).toBe(testJob.output);
        });
        
    });
    
    describe('Retrieving a saved job', function () {
        
        var jobResult;
        
        beforeEach(function () {
            
            if(jobIds.length == 1) 
                throw new Error("The test has no Job ID to query!");
            
            
            
        });
        
        var act = function (jobID, done) {
            
            jobRepository.getJobById(jobID)
                .then(function (job) {
                    jobResult = job;
                    done();
                });
        }
        
        describe('with a valid mongoID', function () {
            beforeEach(function (done) {
                
                var jobID = jobIds[0].toString();
                act(jobID, done);
            });
            
            it('should have applied an id', function () {
                expect(jobResult.id).not.toBe(null);            
            });
            
            it('should resolve the saved job', function () {
                expect(jobResult.user).toBe(testJob.user);
                expect(jobResult.body).toBe(testJob.body);
                expect(jobResult.output).toBe(testJob.output);
            });
            
        });
        
        describe('with an invalid mongo-object-id', function () {
            beforeEach(function (done) {
                act('junky-id', done);
            });
            
            it('should have returned null', function () {
                expect(jobResult).toBe(null);
            });
        });
        
        describe('with an unknown id', function () {
            beforeEach(function (done) {
            
                act('4cdfb11e1f3c000000007822', done);
            });
            
            it('should have resolved null', function () {
                expect(jobResult).toBe(null);
            });
            
        });
        

    });
    
    describe('Listing a user\'s jobs.', function () {
        
        var jobList;
        
        beforeEach(function (done) {
            
            jobRepository.getJobsByUser(testJob.user)
            .then(function (jobs) {
                jobList = jobs;
                done();
            });
        
        });
        
        it('should have jobs in it', function () {
            expect(jobList.length > 0).toBe(true); 
        });
    });

});
