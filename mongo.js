var mongodb = require("mongodb");
var config  = require("./config.json").mongodb;


var server_options = { auto_reconnect: true };

var mongoserver  = new mongodb.Server("localhost", mongodb.Connection.DEFAULT_PORT, server_options),
    db  = new mongodb.Db("WebJCL", mongoserver, {w: 1, journal:true });

console.log("Establishing connection to MongoDB");

db.open(function(err, mc)
{
	console.log("MongoDB connected.");
	
});

module.exports = db;


