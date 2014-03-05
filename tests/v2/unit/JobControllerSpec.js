'use strict';
var root = '../../..';

var Q = require('q')

var JobController = require(root + '/framework/JobController.js');
var JclProcessor = require(root + '/framework/JclProcessor.js');
var JobRepository = require(root + '/framework/JobRepository.js');
var Job = require(root + '/models/Job.js');

describe('JobController Module', function () {
    var jobController, 
    jclProcessor, jobRepository,
    jclProcessorTask, deferred;
    
    beforeEach(function () {
        
        // Configure mock JclProcessor
        jclProcessor = new JclProcessor();
        jclProcessorTask = Q.defer();
        spyOn(jclProcessor, 'submitJob')
            .andReturn(jclProcessorTask.promise);
        
        // Configure mock jobRepository
        jobRepository = new JobRepository();
        spyOn(jobRepository, 'saveJob')
            .andCallThrough();
        
        jobController = new JobController();
        jobController.jclProcessor = jclProcessor;
        jobController.jobRepository = jobRepository;
    });
    
    it('should instantiate', function () {
        expect(jobController instanceof JobController).toBe(true)
    });
    
    describe('when asked to submit a job', function () {
        
        var jobCtrlTask, jobCtrlTaskResolvedVal, jobSubmission, processedJob, 
        un, pw, body;
        
        beforeEach(function () {
            
            un = 'KC00000';
            pw = '12345';
            body = 'JCL';
            processedJob = new Job({
               user: un,
               body: body,
               output: 'fooo'
            });
            
            // Act
            jobCtrlTask = jobController
                .submitJob(body, un, pw);
        });
        
        it('should return a promise', function () {
            expect(jobCtrlTask.then).toBeDefined();
        });
        
        it('should submit the job to the JclProcessor', function () {
            expect(jclProcessor.submitJob)
                .toHaveBeenCalledWith(body, un, pw);
        });
        
        describe('after the job completes', function () {
        
            beforeEach(function (done) {
                
                jclProcessorTask.resolve(processedJob);

                // Check resolved value of jobController.submitJob
                jobCtrlTask.then(function (value){
                    jobCtrlTaskResolvedVal = value;
                    done();
                });
            });
        
            it('should persist the job', function () {
                expect(jobRepository.saveJob)
                    .toHaveBeenCalledWith(processedJob);
            });
        
            it('should resolve the completed job', function () {
                expect(jobCtrlTaskResolvedVal).toBe(processedJob)
            });
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



