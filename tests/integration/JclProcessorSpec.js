var root = '../..'

var grunt = require('grunt');
var uuid = require('node-uuid');
var Q = require('q');

var JclProcessor = require(root + '/framework/JclProcessor.js');

/**
 * Test requires a running FTP server with the following settings
 */

var testFtpHost = grunt.config
        .get('jasmine_node.integration.ftpHost') || 'localhost',
        
    testFtpPort = grunt.config
        .get('jasmine_node.integration.ftpPort') || '2121',
        
    creds = grunt.config
        .get('jasmine_node.integration.auth') || {};
        
    testFtpUser = creds.user || 'goodUser',
    testFtpPass = creds.pass || 'goodPass';

describe('JCLProcessor', function () {
    
    var jclProcessor, testJob;
    
    beforeEach(function () {
        
        testJob = 'asdf';
        
        jclProcessor = new JclProcessor({
            host: testFtpHost,
            port: testFtpPort
        });
    });
    
    describe('when submitting a job', function () {
    
        var resolvedJob, resolvedError;
        
        beforeEach(function (done) {
            
            jclProcessor.submitJob(testJob, testFtpUser, testFtpPass)
                .then(function (job) {
                    resolvedJob = job;
                    done();
                }, function(output) {
                  resolvedError = output;
                  done();  
                });
        });
        
        it('should resolve to the jobOutput', function () {
            expect(resolvedJob).toBeDefined();
            expect(resolvedJob).not.toEqual('');
        });
        
        it('should not resolve to an error', function () {
            expect(resolvedError).not.toBeDefined();
        });
    });
    
    describe('after multiple jobs have been handled', function () {
        
        it('should not return another job\'s output.', function (done) {
        
            // Create an array of promises for each
            var jobs = [];
        
            // Define a function which submits a job with a specified body
            // and verifies that it returns something we expect.
            function submitJobAndAssertExpectedOutput() {
                var deferred = Q.defer();
                
                // make the job body have something unique in it
                var jobBody = uuid();
                
                // submit the job
                var job = jclProcessor
                    .submitJob(jobBody, testFtpUser, testFtpPass)
                    .then(function (output) {
                        
                        // Bug detection
                        expect(output).toContain(jobBody)
                        
                        deferred.resolve();
                    });
                
                return deferred.promise;
            }
            
            // Submit 7 jobs all at once.
            for (var i = 0; i < 7; i++) {
                jobs.push(submitJobAndAssertExpectedOutput())
            }
            
            // End test when all job submissions have finished.
            Q.all(jobs).then(function () {
                done()
            });
            
        });
        
    });

});
