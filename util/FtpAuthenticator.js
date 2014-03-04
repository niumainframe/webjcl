'use strict';
var JSFtp = require('jsftp');
var NodeCache = require('node-cache');

function FtpAuthenticator (config) {
    
    var ftpFactory = config.ftpFactory,
        cache = config.cache,
        host = config.host,
        port = config.port;
    
    function putCache (user, pass) {
        
        cache.set(user, pass,
            function(err, success) {
                if (err) {
                    console.error(err);
                }
            });
    }
    
    function checkWithFTP(user, pass, callback) {
        
        var ftp = ftpFactory({
                host: config.host, 
                port: config.port
            });
            
        ftp.auth(user, pass, function (err, msg) {
            
            ftp.raw.quit(function(err, data) {
                if (err) return console.error(err);
            });

            if(err) {
                callback(null, false);
            } else {
                putCache(user, pass);
                callback(null, user);
            }
        });
    }
    
    return function (user, pass, result) {
        console.log('hi');
        cache.get(user, function (err, values) {
            
            if(!values.hasOwnProperty(user)) 
                checkWithFTP(user, pass, result);
            
            else if (values[user] === pass)
                result(err, user);
                
            else
                result(null, false);
        });
    }
}



module.exports = FtpAuthenticator;
