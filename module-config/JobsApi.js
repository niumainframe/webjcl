/*
 * This is a concrete configuration for the Jobs API
 * The module should return an end-to-end configured
 * express app for production use.
 */


var root = '..'
var config = require(root + '/config.js');

var JobController = require(root + '/framework/JobController');
var JobRepository = require(root + '/framework/MemoryJobRepository');
//var mongo = require(root + '/module-config/mongo');
var JclProcessor = require(root + '/framework/JclProcessor');
var FtpBasicAuth = require(root + '/util/middleware').FtpBasicAuth
var JobsApi = require(root + '/http/JobsApi');



var jobRepository = new JobRepository();

var jclProcessor = new JclProcessor({
        host: config.ftpHost,
        port: config.ftpPort
    });

var credentialsTTL = 30 * 60;
var ftpBasicAuth = FtpBasicAuth(config.ftpHost,
    config.ftpPort, credentialsTTL);

var jobController = new JobController({
        jclProcessor: jclProcessor,
        jobRepository: jobRepository
    });

var configuredJobsApi = JobsApi({
    jobController: jobController,
    authenticator: ftpBasicAuth
});

module.exports = configuredJobsApi;
