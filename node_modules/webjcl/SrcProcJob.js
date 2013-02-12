/*
*/

// Obtain the EventEmitter class to interit from.
EventEmitter = require('events').EventEmitter;

var SrcProcJob = function(jobid, status, output, files)
{

	// Inherit from event emitter
	EventEmitter.call(this);
	
	
	// Unique job identifier
	this.id = jobid; // TODO, normalize 'id' data member to jobid.

	this.status = status;
	
	this.output = output;
	this.files = files;
	

}


SrcProcJob.prototype.getStruct = function()
{
	
	return { 
		jobid: this.id,
		status: this.status,
		output: this.output,
		files: this.files
	};
	
}

// Inherit from EventEmitter
SrcProcJob.prototype = new EventEmitter();  // Here's where the inheritance occurs 
SrcProcJob.prototype.constructor=SrcProcJob;

//
//
////////////////////////////////////////////////////////////////////////
// Static status code enums
//

SrcProcJob.status = {};

// new: upon creation, but not ready to begin.
// Files may have to be written or other preresiquites fetched.
SrcProcJob.status.new     = 0;

SrcProcJob.status.ready   = 1;
SrcProcJob.status.running = 2;
SrcProcJob.status.done    = 3;


//
//
////////////////////////////////////////////////////////////////////////
// Static completions code enums
//
SrcProcJob.completion = {};
SrcProcJob.completion.incomplete = 4;
SrcProcJob.completion.success    = 5;
SrcProcJob.completion.fail       = 6;



module.exports = SrcProcJob
