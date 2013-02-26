var mongodb = require("mongodb");
var config  = require("./config.js").mongodb;


var server_options = { auto_reconnect: true };


var mongoserver  = new mongodb.Server(config.hostname, config.port, server_options),
    db  = new mongodb.Db("WebJCL", mongoserver, {w: 1, journal:true });

console.log("Establishing connection to MongoDB");

db.open(function(err, db)
{
	db.authenticate(config.username, config.password);
	console.log("MongoDB connected.");
});

module.exports = db;


