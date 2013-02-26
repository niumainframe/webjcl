/*
 * JESProc
 * 
 * Processes source code for consumption by IBM's job entry spooler.
 * Each job is assigned an ID, and the ID of that job ID is emitted
 * when the job is complete.
 * 
 * Things that may be added to the ISrcProc specification:
 * 
 *   * Concept of a JobWorker / Defined job object
 * 
*/


var os = require('os');

var config = require('./config.json');
var JobSet = require('./JobSet.js');
var ISrcProc = require('../../framework/ISrcProc.js');
var ISrcProcJob = require('../../framework/ISrcProcJob.js');
var JESWorker = require('./JESWorker.js');


// JESProc constructor
var JESProc = function()
{
	var self = this;
	
		
	// Create a jobset to manage jobs.
	// TODO: Interval cleaning of jobs?
		
	// Give the db instance to JobSet.
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
 * @callback
 * 	It returns {status, jobid} of the job that was created;
 *  If job creation failed, it returns {status: 400}
 * 
 */
JESProc.prototype.takeJob = function(action, files, options, callback)
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
			this.JobSet.addJob(worker, function(err, id)
			{
				
				// return the id of the new job.
				callback({status: 202, id: id});
				
				// Start the worker once it's ready.
				worker.once(ISrcProcJob.statusCode.ready, function()
				{
					worker.start(function(){});
				});
				
				
				// Emit the job's id when the job is done.
				worker.once(ISrcProcJob.statusCode.done, function()
				{
					self.JobSet.updateJob(worker);
					self.emit(worker.id);
				});
				

			
			});
			
			
		
			break;
			
			
		default:
		
			callback({status: 400});
			
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
 * @callback
 * 
 */
JESProc.prototype.getJob = function(jobid, callback)
{
	
	var job = this.JobSet.getJob(jobid, function(err, job)
	{

			
		callback(err, job);
		
		
	});
	

	
}



JESProc.prototype.listJobs = function(user, callback)
{
	
	this.JobSet.listJobs(user, function(err, jobs)
	{
		
		callback(err, jobs);
			
	});
	
}


//
//
////////////////////////////////////////////////////////////////////////
// Export this module.
module.exports = JESProc;
