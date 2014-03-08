var Q = require('q');
var Job = require('../models/Job');

var JobController = function (config) {
    
    config = config || {};
    
    this.jclProcessor = config.jclProcessor || 
        console.warn('JobController requires jclProcessor');
        
    this.jobRepository = config.jobRepository ||
        console.warn('JobController requires jobRepository');
    
    Object.seal(this);
}

JobController.prototype.submitJob = function (body, un, pw) {
    var self = this;
    
    var ourDefer =  Q.defer();
    
    this.jclProcessor.submitJob(body, un, pw)
        .then(function (completedJob) {
            
            // Generate Job Model
            var job = new Job({
                output: completedJob,
                body: body,
                user: un
            });
            
            self.jobRepository.saveJob(job)
                .then(function (savedJobID) {
                    job.id = savedJobID;
                    ourDefer.resolve(job);
                });
        }, function(error) {
            
            ourDefer.reject(error);
            
        });
        
    
    return ourDefer.promise;
}

JobController.prototype.listJobs = function(user) {
    
    var ourDefer =  Q.defer();
    
    this.jobRepository.getJobsByUser(user)
        .then(function(jobs) {
            ourDefer.resolve(jobs);
        });
    
    return ourDefer.promise;
}


JobController.prototype.getJobById = function(id) {
    
    var ourDefer =  Q.defer();
    
    this.jobRepository.getJobById(id)
        .then(function (job) {
            ourDefer.resolve(job);
        });
    
    return ourDefer.promise;
    
}
module.exports = JobController;
