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
    user = creds.user || 'goodUser',
    pass = creds.pass || 'goodPass';

var testJob = 'asdf';
    testJobId = 2345,
    
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

    frisby.create('The client should be available on /')
        .get(host + '/')
        .expectStatus(200)
        .expectHeaderContains('Content-Type', 'text/html')
        .toss();


    frisby.create('Submit Job')
        .post(host + mount + '/jobs', null, {
                headers: {
                    'content-type': 'text/plain'
                },
                body: testJob,
                auth: { user: user, pass: pass }
        })
        .expectJSON({
            user: user,
            body: testJob,
            output: function(val) {
                expect(val).toContain(testJob);
            },
            id: function(val) {
                expect(val.match(/^[0-9a-fA-F]+$/))
                    .toBeTruthy();
            },
            date: function(val) {
                var parseDate = new Date(val).toString();
                expect(parseDate).not.toBe('Invalid Date');
            }
        })
        .expectStatus(200)
        .toss();

    frisby.create('Get job by id')
        .get(host + mount + '/jobs/' + testJobId, {
            auth: { user: user, pass: pass }
        })
        .expectStatus(200)
        .toss();
        
    frisby.create('Get user\'s saved jobs')
        .get(host + mount + '/jobs', {
            auth: { user: user, pass: pass }
        })
        .expectJSONTypes('*', {
            user: user,
            body: String,
            output: String,
            id: function(val) {
                expect(val.match(/^[0-9a-fA-F]+$/))
                    .toBeTruthy();
            },
            date: function(val) {
                var parseDate = new Date(val).toString();
                expect(parseDate).not.toBe('Invalid Date');
            }
        })
        .expectStatus(200)
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
