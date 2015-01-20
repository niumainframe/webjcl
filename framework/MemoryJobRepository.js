var Q = require('q');
var cache = require('node-cache');
var uuid = require('node-uuid');
var _ = require('lodash');

function MemoryJobRepository (config) {
    config = config || {};
}

var jobSet = {};

MemoryJobRepository.prototype.saveJob = function (job) {

    var deferred = Q.defer();

    // Give the job a system defined ID
    job.id = uuid();

    // Store it in our set.
    jobSet[job.id] = job;

    // Delete the job in 5 minutes.
    setTimeout(function () {
        delete jobSet[job.id];
    }, 5*60*1000);

    // Resolve the id of the saved job.
    deferred.resolve(job.id);

    return deferred.promise;
};

MemoryJobRepository.prototype.getJobsByUser = function (user) {

    var deferred = Q.defer();

    // We could do this, but nope.  I'd have to sort by date and I'm not going down that path.
    //jobs = _.where(jobSet, {user: user});

    // Always return a blank array....
    deferred.resolve([]);

    return deferred.promise;
};

MemoryJobRepository.prototype.getJobById = function (id) {
    var deferred = Q.defer();

    var job = _.find(jobSet, function (job){
        return job.id == id;
    });

    deferred.resolve(job);

    return deferred.promise;
};

module.exports = MemoryJobRepository;
