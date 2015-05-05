/*
 * This is a concrete configuration for the Jobs API
 * The module should return an end-to-end configured 
 * express app for production use.
 */ 
 

var root = '..'
var config = require(root + '/config.js');

var JobController = require(root + '/framework/JobController');
var JobRepository = require(root + '/framework/JobRepository');
var mongo = require(root + '/module-config/mongo');
var JclProcessor = require(root + '/framework/JclProcessor');
var FtpBasicAuth = require(root + '/util/middleware').FtpBasicAuth
var SharedJobsApi = require(root + '/http/SharedJobsApi');



var jobRepository = new JobRepository({
    mongoDb: mongo
    });
    
var jclProcessor = new JclProcessor({
        host: config.ftpHost,
        port: config.ftpPort
    });

var jobController = new JobController({
        jclProcessor: jclProcessor,
        jobRepository: jobRepository
    });

var configuredJobsApi = SharedJobsApi({
    jobController: jobController
});

module.exports = configuredJobsApi;
