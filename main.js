var express = require('express');
var fs = require('fs');



var app = express();
app.use(express.bodyParser());

// Serve static files out of the client directory.
app.use(express.static('client'));

// Maintains a list of registered source processors.
var srcprocs = {}


/* Register source processors */
fs.readdir('./srcprocs', function (err, files)
{
	
	if (err)
		throw err;
	
	for (var index in files)
	{
		
		var file = files[index];
		
		//Skip README.md
		if (file == "README.md")
			continue;
		
		var name = file;
		
		console.log("Loading source processor from " + file);
		srcproc = require('./srcprocs/'+file);
		
		
		srcprocs[name] = new srcproc();
		
	}
	
	console.log("Done loading source processors.")
	
	
});
	


// A nice placeholder callback.
function notImplementedHandler(req, res)
{
	res.status(501);
	
	var json = {}
	
	for (var i in req.params)
	{
		json[i] = req.params[i];
	}

	res.json(json);
}


/**
 * BEGIN REST IMPLEMENTATION *
 * 							**/

//~ GET /srcproc
//~ Return available source processors.

app.get('/srcprocs', notImplementedHandler);


//~ OPTIONS /srcproc/:instance/jobs
//~ Returns what kind of jobs can be performed and their parameters.
app.options('/srcprocs/:instance/jobs', notImplementedHandler);


//~ POST /srcprocs/:instance/jobs
//~ 
//~ Submit job to source processor job queue. 
//~ Example request: { action: 'submit', files: [{file}] , options: {username, password} }

app.post('/srcprocs/:instance/jobs', function(req, res)
{
	
	// Is a valid SrcProc being requested?
	if (srcprocs[req.params.instance] == undefined)
	{
		res.send(404);
		return;
	}
		
	// Find instance of our SrcProc
	var instance = srcprocs[req.params.instance];
	
	// Have the source processor take the job.
	result = instance.takeJob(req.body.action, req.body.files, req.body.options);
	

	/* Now registering 2 listeners:
	 * 
	 * Waiting for either the processor to time out
	 * or for the processor to complete.
	 */
	 
	 
	// Return the data when the job is complete.
	instance.on(result.jobid, function()
	{
	
		console.log(req.params.instance + ": job " + result.jobid +" done.");
		
		var response = instance.getJob(result.jobid);
		
		res.json(response);
		
	});
	
	// or Timeout and return the jobid.
	setTimeout(function()
	{
		
		// Stop waiting on the job.
		instance.removeAllListeners(result.job);
		
		res.status(result.status);
		res.json(result);
		
	}, 5000); // 5 seconds.

	
});


//~ GET /srcprocs/:instance/jobs/:jobid
//~ Returns status and output of the job. It should send the browser the no-cache header. 
//~ Return structure: { status, jobid, output }

app.get('/srcprocs/:instance/jobs/:jobid', notImplementedHandler);


console.log("Listening on :8000");
app.listen(8000);
