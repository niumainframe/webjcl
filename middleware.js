// Custom middleware for WebJCL API
var express = require('express');
var parseTextBody = require('body');
var Q = require('q');
var ftp = require('ftp');
var middleware = {};

var FtpAuthenticator = require('./util/FtpAuthenticator');
var JSFtpFactory = require('./util/JSFtpFactory.js');
var NodeCache = require('node-cache')

middleware.FtpBasicAuth = function (host, port, cacheTime) {
    
    var ftpAuthorizer = FtpAuthenticator({
        host: host,
        port: port,
        ftpFactory: JSFtpFactory,
        cache: new NodeCache({ 
            stdTTL: cacheTime || 30*60 // 30 min default
        })
    });
    return express.basicAuth(ftpAuthorizer);
};

middleware.textBodyParser = function (req, res, next) {
    
    if(req.headers['content-type'] != 'text/plain') {
        next();
        return;
    }
        
    parseTextBody(req, res, function (err, body) {
        req.body = body;
        next();
    });
    
 
}

module.exports = middleware;
