var root = '..'
var Q = require('q');

var JESWorker = require(root + '/framework/JESWorker/JESWorker.js');
var ISrcProcJob = require(root+ '/framework/JESWorker/ISrcProcJob.js');


function JclProcessor (config) {
    
    config = config || {};
    this.host = config.host || 
        console.warn('JclProcessor configured with no host!');
    this.port = config.port ||
        console.warn('JclProcessor configured with no port!');
    
}

/**
 * This will be a facade to the rollercoaster of a submission
 * interface created when this project started. I am sorry.
 */
JclProcessor.prototype.submitJob = function (body, user, pass) {
    
    var self = this;
    var deferred = Q.defer();

    var fileDef = { 
        data: body, 
        path: 'test.jcl' // If it isn't called test.jcl it will fail :'(
    }
    
    // ** Instantiate and configure the JESWorker
    var worker = new JESWorker(fileDef, user, pass);
            
    worker.host = this.host;
    worker.port = this.port;
    // ** ** **

    // So it seems that JESWorker waits for setID to be called.
    // Once this happens, it begins making temporary files/folders
    // with the information provided.
    worker.setID();

    
    // Start the worker once it's 'ready.'
    worker.once(ISrcProcJob.statusCode.ready, function() {
        worker.start(function(output){
            // Then handle the output.
            var jobOutput = worker.outputFiles[0].data;

            // Send back the python output in the error case.
            if(!jobOutput) {
                deferred.reject(worker.output);
                return;
            }

            // Resolve the job output if we're good.
            deferred.resolve(output);
           
        });
    });

    
    
    return deferred.promise;
}

module.exports = JclProcessor;
