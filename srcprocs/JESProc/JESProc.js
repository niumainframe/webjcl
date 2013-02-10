/*
 * Implementation of the ISrcProc interface.
 * 
*/


var os = require('os');

var JobSet = require('./JobSet.js');
var ISrcProc = require('webjcl/ISrcProc');
var JESWorker = require('./JESWorker.js');


// Make a JESProc constructor & have it call the parent's constructor.
var JESProc = function() 
{
	
	this.JobSet = new JobSet();
	
	// Call the parent constructor on 'this' object.
	ISrcProc.call(this);
}

// Officially inherit from ISrcProc
JESProc.prototype = new ISrcProc();        // Here's where the inheritance occurs 
JESProc.prototype.constructor=JESProc;


// Reimplement Methods...
JESProc.prototype.listJobOptions = function()
{
	console.error( "Not Implemented!" );
}

JESProc.prototype.takeJob = function(action, files, options)
{
	var self = this;
	
	// Assume first file is the jcl file.
	var file = files[0];
	
	/* Send bad request if we don't have our required options */
	if(options == undefined || 
		options.username == undefined || 
		options.password == undefined)
		return { status: 400, info: "MVS username/password must be provided." };
	
	
	switch(action)
	{
		
		case "submit":
			
			// Prepare a new worker
			worker = new JESWorker(file, options.username, options.password);
			
			// ... and stick it in the JobSet.
			this.JobSet.addJob(worker);
			
			// Start the worker
			if (worker.ready == false)
			{
				// Listen for the worker to be ready.
				console.log("Waiting for worker to be ready.");
				worker.on('ready', this._startWorker);
			}
			else 
			{		// Start the worker if it's already ready.
					this._startWorker(worker);
			}
			
			// Return 202 Accepted along with the id.
			return { status: 202, jobid: worker.id}
			
		
			break;
			
		default:
			return { status: 400, info: "Unknown job action." };
			break;
		
	}
	
	
	
}

JESProc.prototype.getJob = function(jobid)
{
	var job = this.JobSet.getJob(jobid);
	
	return {id: job.id, status: job.status, output: job.output, files: job.outputFiles }
}


/* Specialized Methods */

JESProc.prototype._startWorker = function(worker)
{
	var self = this;
	
	worker.start(function()
		{	// When the worker is done, have the processor emitt that
			// it's done and stick the worker in the JobSet for retrieval.
			self.emit(worker.id);
			self.JobSet.addJob(worker);
		});
}



// Export this module.
module.exports = JESProc;
