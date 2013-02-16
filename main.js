var http  = require('http');
var https = require('https');
var express = require('express');
var fs = require('fs');

var package = require('./package.json');
var config = require('./config.json');


console.log("Starting WebJCL " + package.version);


//
//
////////////////////////////////////////////////////////////////////////////////
// Start Express
//

var app = express();

// Start HTTPS server if configuration is there.
if (config.ssl_key != undefined && config.ssl_cert != undefined)
{
	
	console.log("Loading SSL Certificates");
	
	var https_options = {};
	
	https_options.key = fs.readFileSync(config.ssl_key).toString();
	https_options.cert = fs.readFileSync(config.ssl_cert).toString();
	
	var ssl_server = https.createServer(https_options, app).listen(config.ssl_port);
	
}


// Start HTTP server
var server = http.createServer(app).listen(config.port);

//
//
////////////////////////////////////////////////////////////////////////////////
// Register middleware.
//


// Should we enforce an SSL connection?
if (config.ssl_enforce == true)
{
	app.use(function(req, res, next)
	{
		
		if ('http' == req.protocol)
			res.redirect("https://"+req.host+':'+config.ssl_port+req.url);
		else
			next();

	});
}
	

app.use(express.bodyParser());


// Serve static files out of the client directory.
app.use(express.static('client'));


//
//
////////////////////////////////////////////////////////////////////////////////
// Load source processor modules.
//


// Maintains a list of registered source processors.
var srcprocs = {}


// For each module inside ./srcprocs, load it as a source processor
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
	
	
});
	


//
//
////////////////////////////////////////////////////////////////////////////////
// Begin binding REST API
// BOUND TO CHANGE
//



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
		
	}, config.resTimeout *1000);

	
});


//~ GET /srcprocs/:instance/jobs/:jobid
//~ Returns status and output of the job. It should send the browser the no-cache header. 
//~ Return structure: { status, jobid, output }

app.get('/srcprocs/:instance/jobs/:jobid', notImplementedHandler);




//
//
////////////////////////////////////////////////////////////////////////////////
// Utility functions
//

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








