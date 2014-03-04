var Q = require('q');

var JobController = function () {
    
    this.jclProcessor = null;
    this.jobRepository = null;
    
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


module.exports = JobController;
