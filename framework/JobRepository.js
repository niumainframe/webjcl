var Q = require('q');

function JobRepository () {
    
    
}

JobRepository.prototype.saveJob = function (job) {
    var deferred = Q.defer();
    
    deferred.resolve(job);
    console.log('JobRepository.saveJob()', job);
    
    return deferred.promise;
}

JobRepository.prototype.getJobsByUser = function (user) {
    
    var deferred = Q.defer();
    deferred.resolve({'error': 'jobreponotimplemented'});
    console.log('JobRepository.getJobsByUser()', user);
    
    return deferred.promise;
}

JobRepository.prototype.getJobById = function (id) {
    
    var deferred = Q.defer();
    deferred.resolve({'error': 'jobreponotimplemented'});
    
    console.log('JobRepository.getJobById()', id);
    
    return deferred.promise;
}

module.exports = JobRepository;
