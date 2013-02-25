/*
*/

// Obtain the EventEmitter class to interit from.
EventEmitter = require('events').EventEmitter;

var ISrcProcJob = function(jobid, status, output, files)
{

	// Inherit from event emitter
	EventEmitter.call(this);
	
	
	// Unique job identifier
	this.id = jobid; // TODO, normalize 'id' data member to jobid.

	this.status = status;
	
	this.output = output;
	this.files = files;
	

}


// Inherit from EventEmitter
ISrcProcJob.prototype = new EventEmitter();  // Here's where the inheritance occurs 
ISrcProcJob.prototype.constructor=ISrcProcJob;


ISrcProcJob.prototype.getStruct = function()
{
	
	return { 
		jobid: this.id,
		status: this.status,
		output: this.output,
		files: this.files
	};
	
}



//
//
////////////////////////////////////////////////////////////////////////
// Static status code enums
//


ISrcProcJob.statusCode = { new:     0, // Files may have to be written or other preresiquites fetched.
                           ready:   1,
                           running: 2,
                           done:    3};






//
//
////////////////////////////////////////////////////////////////////////
// Static completions code enums
//
ISrcProcJob.completion = { incomplete: 4,
                           success: 5,
                           fail:    6 };


module.exports = ISrcProcJob
