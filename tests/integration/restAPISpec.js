var frisby = require('frisby');
var request = require('request');
var child_process = require('child_process');
var grunt = require('grunt');

var host = grunt.config.get('jasmine_node.integration.apiEndpoint');
var creds = grunt.config.get('jasmine_node.integration.auth');

var testJob = "//" + creds.user + "A JOB ,'CSCI360',MSGCLASS=H";

frisby.globalSetup({ timeout: 10000 });


describe('WebJCL REST API', function () {

    describe('Index request', function () {
        
        frisby.create('GET / should return HTML')
            .get(host + '/')
            .expectHeaderContains('Content-Type', 'text/html')
            .expectStatus(200)
            .toss();
    });
    
    describe('Job listing', function () {
        
        var jobListingFrisby = function (name, user, pass) {
            var endpoint = '/srcprocs/JESProc/jobs';
            
            return frisby.create(name)
                .get(host + endpoint, { auth: {user: user, pass:pass}});
        }
        
        jobListingFrisby('with valid credentials', creds.user, 
            creds.pass)
            .expectStatus(200)
            .expectJSONTypes('', Array)
            .expectHeaderContains('Content-Type', 'application/json')
            .toss();

        jobListingFrisby('with invalid credentials', creds.user, 
            'badPassword')
            .expectStatus(401)
            .expectHeaderContains('Content-Type', 'text/plain')
            .expectBodyContains("Unauthorized")
            .toss();
    });

    describe('Posting a job', function () {
        
        var payload = {
            action: 'submit',
            files: [
                { path : 'test.jcl', data: testJob }
            ]
        };
        
        frisby.create('POST /srcprocs/JESProc/jobs')
            .post(host + '/srcprocs/JESProc/jobs', payload, { 
                json: true,
                auth: { user: creds.user, pass: creds.pass }
            })
            .expectHeaderContains('Content-Type', 'application/json')
            .expectStatus(200)
            .expectJSONTypes({
                id: String,
                output: String,
                outputFiles: Array,
                files: Array,
            })
            .expectJSON({
                outputFiles: function(val) {
                    expect(val[0].data)
                        .toContain(payload.files[0].data);
                },
                status: 3,
                completion: 5,
                username: creds.user
            })
            .toss();
        
    });
 
    describe('Retrieving a saved job', function () {
        
        var jobSubPayload = {
            action: 'submit',
            files: [{ path : 'test.jcl', data: testJob }]
        };
        
        // Define the test beforehand so that we 
        // can change the uri after we post a job.
        var frisbyTest = frisby.create('POST /srcprocs/JESProc/jobs/:jobID')
            .get(host + '/srcprocs/JESProc/jobs/', { 
                auth: { user: creds.user, pass: creds.pass }
            })
            .expectHeaderContains('Content-Type', 'text/plain')
            .expectStatus(200)
            .expectBodyContains(testJob);
        
        beforeEach(function (done) {
            
            // Post a job and obtain the id for retrieval
            request({
                url: host + '/srcprocs/JESProc/jobs',
                json: jobSubPayload,
                method: "POST",
                auth: { user: creds.user, pass: creds.pass }
            }, 
            function (error, response, body) {
                if(error) {
                    console.log(response);
                    throw error
                }

                if (!body.id) {
                    console.log(body);
                    throw "Could not obtain id for posted job.";
                }
                
                frisbyTest.current.outgoing.uri = frisbyTest.current.outgoing.uri + body.id;
                done();
            });
        });
        
        frisbyTest.toss();
    }); 

});
