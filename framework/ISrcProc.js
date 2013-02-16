// Obtain the EventEmitter class to interit from.
var EventEmitter = require('events').EventEmitter;

// Constructor...
var ISrcProc = function() 
{
	// Inherit from event emitter
	EventEmitter.call(this);
	
}

// Officially inherit from ISrcProc
ISrcProc.prototype = new EventEmitter();  // Here's where the inheritance occurs 
ISrcProc.prototype.constructor=ISrcProc;


/* Methods */
ISrcProc.prototype.listJobOptions = function()
{
	console.error( "Not Implemented!" );
}

ISrcProc.prototype.takeJob = function(action, files, options)
{
	console.error( "Not Implemented!" );
}

ISrcProc.prototype.getJob = function(jobid)
{
	console.error( "Not Implemented!" );
}


module.exports = ISrcProc;
