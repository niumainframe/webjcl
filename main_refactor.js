var express = require('express');
var config = require('./config.js');

var webJCLExpressApp = require('./module-config/WebJCLExpressApp');

// Start HTTP server
webJCLExpressApp.listen(config.port);
