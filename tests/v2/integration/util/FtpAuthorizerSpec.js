var root = '../../../..';
var grunt = require('grunt');
var FtpAuthenticator = require(root + '/util/FtpAuthenticator.js');
var JSFtpFactory = require(root + '/util/JSFtpFactory.js');

var NodeCache = require('node-cache');


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
    
describe('FtpAuthenticator integrated with JSFtp and nodecache', function () {
    
    var ftpAuthenticator, ftpFactory, cache;
    var err, code;
    var realDateClass = Date;
    
    beforeEach(function () {
        
        cache = new NodeCache( { stdTTL: 60*10 /*10m*/ } );
        
        ftpFactory = jasmine.createSpy('FtpFactory')
            .andCallFake(JSFtpFactory);
        
        ftpAuthenticator = FtpAuthenticator({
            host: testFtpHost,
            port: testFtpPort,
            ftpFactory: ftpFactory,
            cache: cache
        });
        
    });
    
    afterEach(function() {
       Date = realDateClass; 
    });
        
    it('should successfully authenticate with good credentials', function (done) {
        ftpAuthenticator(testFtpUser, testFtpPass, function (err, username) {
            expect(err).toBe(null);
            expect(username).toBe(testFtpUser);
            done();
        });
    });
    
    it('should not successfully authenticate with bad credentials', function (done) {
        ftpAuthenticator(testFtpUser, 'badPass', function (err, username) {
            expect(username).toBe(false);
            done();
        });
    });
    
    describe('when the credentials are cached', function () {
        
        beforeEach(function (done) {
            
            cache.set(testFtpUser, testFtpPass, function () {
                done();
            });
            
        });
        
        describe('when the credentials have not expired', function () {
            
            beforeEach(function (done) {
            
                ftpAuthenticator(testFtpUser, testFtpPass, function(err, username) {
                        done();
                });
            });
            
            it('should not create an ftp connection', function () {
                expect(ftpFactory).not.toHaveBeenCalled();
            });
        });
        
        describe('when the credentials have expired', function () {
            
            beforeEach(function (done) {
                
                // Mock Date
                Date = function () {
                    
                    this.getTime = function () {
                        // Fast forward one day.
                        return realDateClass.now()+ 24 * 60 * 60 * 1000;
                    };
                }
        
                Date.now =  function () {
                        return realDateClass.now()
                }
                
                // Have the cache go through it's pruning routine
                cache._checkData(false);
                
                ftpAuthenticator(testFtpUser, testFtpPass, function(err, username) {
                    done();
                });
            });
            
            it('should create an ftp connection', function () {
            expect(ftpFactory).toHaveBeenCalled();
        });
            
        });
        
    });

});
