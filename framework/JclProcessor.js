var Q = require('q');
var Job = require('../models/Job');
function JclProcessor () {
    
}

JclProcessor.prototype.submitJob = function (body, user, pass) {
    
    var deferred = Q.defer();
    deferred.resolve(new Job());
    return deferred.promise;
}

module.exports = JclProcessor;
