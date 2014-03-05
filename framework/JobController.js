var Q = require('q');

var JobController = function (config) {
    
    
    
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

            self.jobRepository.saveJob(completedJob);
            
            ourDefer.resolve(completedJob);
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
