// Custom middleware for WebJCL API
var express = require('express');
var parseTextBody = require('body');
var Q = require('q');
var ftp = require('ftp');
var NodeCache = require('node-cache')

var FtpAuthenticator = require('./FtpAuthenticator');
var JSFtpFactory = require('./JSFtpFactory.js');


var middleware = {};

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
    
    if(!req.is('text/plain')) {
        next();
        return;
    }
    
    parseTextBody(req, res, function (err, body) {
        req.body = body;
        next();
    });
    
 
}

module.exports = middleware;
