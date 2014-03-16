'use strict';
var root = '../..';

var JobRepository = require(root + '/framework/JobRepository.js');
var Job = require(root + '/models/Job');
var mongo = require(root + '/module-config/mongo');

describe('JobRepository (integrated with MongoDB)', function () {

    var jobRepository, testJob, originalJobId = 'abcdef12345';
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
        
        var savedId;
        
        beforeEach(function (done) {
            savedId = null;
            
            jobRepository.saveJob(testJob)
                .then(function (id) {
                    savedId = id;
                    jobIds.push(id);
                    done();
                });
        });
        
        it('should resolve an id', function () {
            expect(savedId.toString().match(/^[0-9a-fA-F]+$/))
                .toBeTruthy();
        });
        
        it('should not have added the _id property to the job', function () {
            expect(testJob._id).not.toBeDefined();
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
                expect(jobResult.id).toBeTruthy();            
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
            var listLen = jobList.length;
            expect(listLen > 0 && listLen <= 5).toBe(true); 
        });
        
        it('each job should have an id', function () {
            jobList.forEach(function (job) {
                expect(job.id).toBeDefined();
                expect(job._id).not.toBeDefined();
            });
        });
    });
});
