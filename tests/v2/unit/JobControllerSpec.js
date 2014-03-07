'use strict';
var root = '../../..';

var Q = require('q')

var JobController = require(root + '/framework/JobController.js');
var JclProcessor = require(root + '/framework/JclProcessor.js');
var JobRepository = require(root + '/framework/JobRepository.js');
var Job = require(root + '/models/Job.js');

describe('JobController Module (unit)', function () {
    var jobController, jclProcessor, jobRepository,
        testDBId, testJobOutput;
    
    beforeEach(function () {
        
        // Configure mock JclProcessor
        testJobOutput = 'Some random Job Text';
        
        jclProcessor = new JclProcessor();
        
        spyOn(jclProcessor, 'submitJob')
            .andCallFake(function (job) {
                var deferred = Q.defer();
                deferred.resolve(testJobOutput);
                return deferred.promise
            });
        
        // Configure mock JobRepository
        testDBId = '123123123';
        
        jobRepository = new JobRepository({
                mongoDb: {}
            });
        spyOn(jobRepository, 'saveJob')
            .andCallFake(function (job) {
                var deferred = Q.defer();
                deferred.resolve(testDBId);
                return deferred.promise;
            });


        jobController = new JobController({
            jclProcessor: jclProcessor,
            jobRepository: jobRepository
        });
    });
    
    it('should instantiate', function () {
        expect(jobController instanceof JobController).toBe(true)
    });
    
    describe('when asked to submit a job', function () {
        
        var jobCtrlTask, resolvedValue;
        var testUser, testPass, testJobBody, expectedJob;
        
        beforeEach(function (done) {
            
            // Assemble test values
            testUser = 'KC00000';
            testPass = '12345';
            testJobBody = 'JCL';
            
            expectedJob = new Job({
                user: testUser,
                body: testJobBody,
                output: testJobOutput
            });

            // Act
            jobCtrlTask = jobController
                .submitJob(testJobBody, testUser, testPass)
                .then(function (value){
                    resolvedValue = value;
                    done();
                });
        });
        
        
        it('should return a promise', function () {
            expect(jobCtrlTask.then).toBeDefined();
        });
        
        it('should submit the job to the JclProcessor', function () {
            expect(jclProcessor.submitJob)
                .toHaveBeenCalledWith(testJobBody, testUser, testPass);
        });
        
        it('should persist the job', function () {
            
            expect(jobRepository.saveJob)
                .toHaveBeenCalled();
            
            var receivedJob = jobRepository.saveJob
                .mostRecentCall.args[0]
                
            expect(receivedJob.output)
                .toEqual(testJobOutput);
                
            expect(receivedJob.body)
                .toEqual(testJobBody);
                
            expect(receivedJob.user)
                .toEqual(testUser);
        });
        
        it('should apply the repository ID to the job', function () {
            expect(resolvedValue.id)
                .toEqual(testDBId);
        });
        
        it('should resolve the completed job', function () {
            
            expect(resolvedValue.output)
                .toEqual(testJobOutput);
                
            expect(resolvedValue.body)
                .toEqual(testJobBody);
                
            expect(resolvedValue.user)
                .toEqual(testUser);
        });
    });

    describe('when asked to list jobs', function () {
        
        var listJobsTask, getJobsByUserDefer, returnedJobs;
        
        var testUser = 'TESTUSER';
        var returnedJobs = [{}, {}];
        
        beforeEach(function () {
            
            // Stub on repo's getJobsByUser
            getJobsByUserDefer = Q.defer();
            spyOn(jobRepository, 'getJobsByUser')
                .andReturn(getJobsByUserDefer.promise);
            getJobsByUserDefer.resolve(returnedJobs);
            
            // Act
            listJobsTask = jobController.listJobs(testUser);
        });
        
        it('should return a promise', function () {
            expect(listJobsTask.then).toBeDefined();
        });
        
        it('should obtain the jobs from the repository', function () {
            expect(jobRepository.getJobsByUser)
                .toHaveBeenCalledWith(testUser);
        });

        it('should resolve the list of the users jobs', function (done) {
            listJobsTask.then(function(jobs) {
               expect(jobs).toBe(returnedJobs); 
               done();
            });
        });
        
    });

    describe('when asked for a job by id', function () {
        
        var getJobTask, getJobByIdRepoTask;
        var testId = 102;
        var testJob = { 'jov': 'jov'};
        
        
        beforeEach(function () {
        
            // Stub on repo's getJobById
            getJobByIdRepoTask = Q.defer();
            spyOn(jobRepository, 'getJobById')
                .andReturn(getJobByIdRepoTask.promise);
            getJobByIdRepoTask.resolve(testJob);
            
            
            getJobTask = jobController.getJobById(testId);
        });
        
        it('should return a promise', function () {
            expect(getJobTask.then).toBeDefined();
        });
        
        it('should obtain the job from the repository', function () {
            expect(jobRepository.getJobById).toHaveBeenCalled();
        });
        
        it('should resolve the returned job', function (done) {
            getJobTask.then(function(job) {
               expect(job).toBe(testJob); 
               done();
            });
        });
    });
});



