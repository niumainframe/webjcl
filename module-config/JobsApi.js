/*
 * This is a concrete configuration for the Jobs API
 * The module should return an end-to-end configured 
 * express app for production use.
 */ 
 
var exp = require('express');

var root = '..'

var JobController = require(root + '/framework/JobController');
var JobRepository = require(root + '/framework/JobRepository');
var JclProcessor = require(root + '/framework/JclProcessor');
var FtpBasicAuth = require(root + '/middleware').FtpBasicAuth
var JobsApi = require(root + '/http/JobsApi');

var jobRepository = new JobRepository();
var jclProcessor = new JclProcessor();
var credentialsTTL = 30 * 60;
var ftpBasicAuth = FtpBasicAuth('localhost', '2121', credentialsTTL);

var jobController = new JobController({
        jclProcessor: jclProcessor,
        jobRepository: jobRepository
    })

var configuredJobsApi = JobsApi({
    jobController: jobController,
    authenticator: ftpBasicAuth
});

module.exports = configuredJobsApi;
