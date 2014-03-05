var root = '../../..';
var frisby = require('frisby');
var grunt = require('grunt');
var http = require('http');
var webJCLExpressApp = require(root + '/module-config/WebJCLExpressApp.js');

frisby.globalSetup({ timeout: 10000 });

var creds = grunt.config
        .get('jasmine_node.integration.auth') || {};

var host = 'http://localhost:30203',
    mount = '/webjcl/v2',
    testId = 2345,
    user = creds.user || 'goodUser',
    pass = creds.pass || 'goodPass';;
        
    
describe('WebJCL REST API E2E Tests', function () {
    var server;
    
    beforeEach(function (done) {
        server = http.createServer(webJCLExpressApp)
            .listen(30203, function() {
                done();
            });
    });
    
    afterEach(function (done) {
        server.close(function() {
            done();
        });
    });
        
    frisby.create('Get job by id')
        .get(host + mount + '/jobs/' + testId, {
            auth: { user: user, pass: pass }
        })
        .expectStatus(200)
        .toss();
        
    frisby.create('Get user\'s saved jobs')
        .get(host + mount + '/jobs', {
            auth: { user: user, pass: pass }
        })
        .expectStatus(200)
        .toss();
        
    frisby.create('Submit Job')
        .post(host + mount + '/jobs', null, {
                headers: {
                    'content-type': 'text/plain'
                },
                body: 'JOb',
                auth: { user: user, pass: pass }
        })
        .expectStatus(200)
        .inspectBody()
        .toss();
        
});

        
        

        






function VerifyAuthorization(name, endpoint) {
    frisby.create(name +' with bad credentials')
        .get(host + '/jobs', {
            auth: { user: creds.user+'bad', pass: creds.pass }
        })
        .expectStatus(401)
        .toss();
}
