var Q = require('q');
var cahce = require('node-cache');
var uuid = require('node-uuid');
var ObjectID = require('mongodb').ObjectID

function JobRepository (config) {
    config = config || {};
    
    this.db = config.mongoDb || console.warn("Need a mongodb connection");
    
}

JobRepository.prototype.saveJob = function (job) {
    
    var deferred = Q.defer();
    
    delete job.id;
    
    this.db.collection('Jobs', {safe:true}, function (err, coll) {
        coll.insert(job, function (err, record) {
            var savedJob = record[0];
            savedJob.id = savedJob._id;
            delete savedJob._id;
            deferred.resolve(savedJob.id);
        });
    });
    
    return deferred.promise;
}

JobRepository.prototype.getJobsByUser = function (user) {
    
    var deferred = Q.defer();
    
    var selector = {user: user};
    var queryOpts = {limit: 5, sort: {id:-1}};
    
    this.db.collection('Jobs', {safe:true}, function (err, coll) {
        coll.find(selector, queryOpts, function(err, result) {
            
            result.toArray(function(err, array) {
                
                array.forEach(function (job) {
                   job.id = job._id;
                   delete job._id;
                });
                
                deferred.resolve(array);
            });
        });
    });
    
    return deferred.promise;
}

JobRepository.prototype.getJobById = function (id) {
    var deferred = Q.defer();

    this.db.collection('Jobs', {safe:true}, function (err, coll) {

        var objectId;
        
        // Attempt to convert the id into a mongo ObjectID
        try {
            objectId = ObjectID(id)
        } catch (e) {
            // Could not convert string to ObjectID
            deferred.resolve(null);
            return deferred.promise;
        }
        
        // Query mongo
        var selector = {_id: objectId };
        coll.findOne(selector, function(err, result) {
            
            if(result) {
                // Ensure that the identifier is on the
                // expected property.
                result.id = result._id;
                delete result._id;
            }
            
            deferred.resolve(result);
        });
    });
    
    return deferred.promise;
}

module.exports = JobRepository;
