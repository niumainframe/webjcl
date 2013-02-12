/*
 * JESProc
 * 
 * Processes source code for consumption by IBM's job entry spooler.
 * Each job is assigned an ID, and the ID of that job ID is emitted
 * when the job is complete.
 * 
 * Things that may be added to the ISrcProc specification:
 * 
 *   * Concept of a JobWorker
 * 
*/


var os = require('os');

var config = require('./config.json');
var JobSet = require('./JobSet.js');
var ISrcProc = require('webjcl/ISrcProc');
var JESWorker = require('./JESWorker.js');


// JESProc constructor
var JESProc = function() 
{
	
	// Create a jobset to manage jobs.
	// TODO: Interval cleaning of jobs?
	this.JobSet = new JobSet();
	
	// Call the parent constructor on 'this' object.
	ISrcProc.call(this);
}

// Officially inherit from ISrcProc
JESProc.prototype = new ISrcProc();        // Here's where the inheritance occurs 
JESProc.prototype.constructor=JESProc;


//
// 
////////////////////////////////////////////////////////////////////////
// Implement base ISrcProc methods.
//
 
JESProc.prototype.listJobOptions = function()
{
	console.error( "Not Implemented!" );
}


/** 
 * JESProc.takeJob
 * 
 * Creates a new job for this source processor to handle.
 * 
 * @param string action
 * 	The action to take on this job.  In this case, only one action is
 * 	currently defined 'submit.'
 * 
 * @param files action
 * 	An array of file objects.  In this implementation, the first file
 *  is assumed as the JCL file to be submitted.
 * 
 * @param options
 * 	The options object which currently requires the username and
 * 	password fields.
 * 
 * @returns
 * 	It returns {status, jobid} of the job that was created;
 *  If job creation failed, it returns {status: 400}
 * 
 */
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
				worker.on('ready', this._startWorker.bind(this));
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




/** 
 * JESProc.getJob
 * 
 * Retrives the specified job by jobid.
 * 
 * @param int jobid
 * 	The jobid to retrieve.
 * 
 * @returns
 * 	It returns... a job!  Hopefully to be defined concretely later.
 *  { id, status, output, files }
 * 
 */
JESProc.prototype.getJob = function(jobid)
{
	var job = this.JobSet.getJob(jobid);
	
	// TODO: case where jobid doesn't exist.
	return {id: job.id, status: job.status, output: job.output, files: job.outputFiles }
}


//
//
////////////////////////////////////////////////////////////////////////
// Declare specialized methods of JESProc
//


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


//
//
////////////////////////////////////////////////////////////////////////
// Export this module.
module.exports = JESProc;
