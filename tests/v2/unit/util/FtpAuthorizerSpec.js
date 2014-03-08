var root = '../../../..';
var FtpAuthenticator = require(root + '/util/FtpAuthenticator.js');

var JSFtp = require('jsftp');
var NodeCache = require('node-cache');


describe('The FTP Authenticaton Factory', function () {
    var ftpFactory, ftpAuthenticator, ftpClient, cache;
    
    var testServer = 'server', testPort = 'port';
    
    beforeEach(function () {
        
        // Make our own stubbed JSFtp client.
        ftpClient = { 
            auth: function(){}, 
            raw: {
                quit: function(){}
            }
        };
            
        spyOn(ftpClient, 'auth')
            .andCallFake(function (user, pass, callback) {
                callback(null, false);
            });
        spyOn(ftpClient.raw, 'quit')
            .andCallFake(function(){});
        
        ftpFactory = jasmine.createSpy('ftpFactory')
            .andCallFake(function () {
                return ftpClient;
            });
            
        cache = new NodeCache();
        spyOn(cache, 'get').andCallThrough();
        spyOn(cache, 'set').andCallThrough();
        
        ftpAuthenticator = FtpAuthenticator({
            host: testServer,
            port: testPort,
            ftpFactory: ftpFactory,
            cache: cache
        });
    });

    describe('when instantiated', function () {
        
        it('should return a authenticaton function', function () {
            expect(ftpAuthenticator).toBeDefined();
            expect(ftpAuthenticator.length).toBe(3);
            expect(typeof ftpAuthenticator).toBe('function');
        });
        
    });
    
    describe('when validating credentials', function () {
        var testUser = 'testuser', testPass = 'asdfpass';
        var returnError, returnUser;
        
        var act = function(done) {
            ftpAuthenticator(testUser, testPass, function (error, user) {
                returnError = error;
                returnUser = user;
                done();
            });
        };
        
        
        describe('always', function () {
        
            beforeEach(function (done) {
                act(done);
            });
            
            it('should check the cache', function () {
               expect(cache.get)
                   .toHaveBeenCalledWith(testUser, jasmine.any(Function)); 
            });
        });

        describe('when the credentials are in the cache', function () {
            
            beforeEach(function (done) {
                // Let there be a value under the username
                cache.set(testUser, 'whatever', function () {
                    done();
                });
            });
            
            describe('always', function () {
                
                beforeEach(function (done) {
                    act(done);
                });
                
                it('should not create an ftp client', function () {
                    expect(ftpFactory).not.toHaveBeenCalled();
                });
            });
            
            describe('when cached authentication fails', function () {
                
                beforeEach(function (done) {

                    // Set cache value not to be our test creds.
                    cache.set(testUser, testPass+'bad', function () {
                        act(done);
                    });
                });
                
                it('should resolve that the credentials were invalid', function () {
                    expect(returnError).toBe(null);
                    expect(returnUser).toBe(false);
                });
            });
        
            describe('when cached authentication succeeds', function () {
                
                beforeEach(function (done) {
                
                    // Set cache value to our test creds.
                    cache.set(testUser, testPass, function () {
                        act(done);
                    });
                });
                it('should resolve that the credentials were valid', 
                    function () {
                    expect(returnError).toBe(null);
                    expect(returnUser).toBe(testUser);
                });
                

            });
            
        });


        
        
        describe('when the credentials are not cached', function () {
            
            beforeEach(function () {
                cache.flushAll();
            });
            
            describe('always', function () {
                
                beforeEach(function (done) {
                    act(done);
                });
                
                it('should create an ftp client', function () {
                    expect(ftpFactory)
                        .toHaveBeenCalledWith({
                            host: testServer, 
                            port: testPort
                        });
                });
                
                it('should check credentials with the ftp server', 
                    function () {
                        
                    expect(ftpClient.auth)
                    .toHaveBeenCalledWith(testUser, testPass, 
                        jasmine.any(Function));
                });
                
                it('should close the ftp connection', function () {
                    expect(ftpClient.raw.quit).toHaveBeenCalled();
                });
                
            });

            
            describe('when ftp authentication fails', function () {
                
                beforeEach(function (done) {
                    ftpClient.auth.plan =  function(user, pass, callb) {
                        callb('[Error: Login not accepted]', undefined);
                    };
                    
                    act(done);
                });
                
                it('should resolve that the credentials were invalid',
                    function () {
                
                    expect(returnError).toBe(null);
                    expect(returnUser).toBe(false);
                });
                
            });
            
            describe('when ftp authentication succeeds', function () {
            
                beforeEach(function (done) {
                
                    ftpClient.auth.plan =  function(user, pass, callb) {
                        callb(null, { 
                            code: 230,
                            text: '230 Login successful.',
                            isMark: false,
                            isError: false 
                        });
                    };
                    
                    act(done);
                    
                });
                

                
                it('should cache the credentials', function () {
                    expect(cache.set)
                        .toHaveBeenCalledWith(testUser, testPass, 
                            jasmine.any(Function));
                });
                
                it('should resolve that the credentials were valid', 
                    function () {
                
                    expect(returnError).toBe(null);
                    expect(returnUser).toBe(testUser);
                });
                
            });
        });
    });
    
});
