var root = '../..'

var grunt = require('grunt');
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

});
