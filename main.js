var http  = require('http');
var https = require('https');
var express = require('express');
var fs = require('fs');
var mongo = require('./mongo.js');
var Authenticator = require('./Authenticator');
var package = require('./package.json');
var config = require('./config.js');


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
	console.log("Forcing SSL.");
	app.use(function(req, res, next)
	{
		
		if ('https' == req.protocol || req.headers["x-forwarded-proto"] === "https")
			next();
		else
			res.redirect("https://"+req.host+':'+config.ssl_port+req.url);
			

	});
}

// Used to obtain the username/password from 
// HTTP basic auth for use in routes.
function customAuth(req, res, next)
{
	var authorization = req.get('Authorization');
	
	if(authorization)
	{
		
		// Obtain the Base64 encoded element of the authentication.
		var parts = authorization.match(/^Basic (.*)$/);
		parts.shift();
		
		var enc_auth = parts[0];
		
		// Convert Base64 to UTF8
		parts = new Buffer(enc_auth, 'base64').toString('utf8');
		
		
		// Split by the delimiter and identify the credentials.
		parts = parts.split(":");
		var username = parts[0];
		var password = parts[1];
		
		req.auth = { username : username,
					 password : password };
	}

	next();

}
app.use(customAuth);


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
	
	
	
	// If authentication wasn't parsed, ask for it.
	if (req.auth == undefined)
	{
		res.set('WWW-Authenticate', 'Basic realm="Source Processor Authentication"');
		res.send(401);
		return;
	}
	
	Authenticator.use(req.auth.username, req.auth.password, function(err, valid)
	{
		
		// Quit if invalid credentials.
		if (!valid)
		{
			res.send(403);
			return;
		}
		
		

	
		// Find instance of our SrcProc
		var instance = srcprocs[req.params.instance];
		
		// Have the source processor take the job.
		instance.takeJob(req.body.action, 
						 req.body.files, 
						 {username: req.auth.username,
						  password: req.auth.password},
						 function(result)
		{
			

			/* Now registering 2 listeners:
			 * 
			 * Waiting for either the processor to time out
			 * or for the processor to complete.
			 */
			 
			 
			// Return the data when the job is complete.
			instance.on(result.id, function()
			{
			
				console.log(req.params.instance + ": job " + result.id +" done.");
				
				instance.getJob(result.id, function(err, job)
				{
					
					var clean_job = {}
					
					for (var key in job)
					{
						
						if (key[0] == '_')
							continue;
							
						clean_job[key] = job[key];

					}
					
					res.json(clean_job);
					
				});
				
				
				
			});
			
			
			// or Timeout and return the jobid.
			setTimeout(function()
			{
				
				// Stop waiting on the job.
				instance.removeAllListeners(result.job);
				
				res.status(result.status);
				res.json(result);
				
			}, config.resTimeout *1000);
			
			
			
		}); // instance.takeJob
		
				
		
	});
	

	
});



app.get('/srcprocs/:instance/jobs', function(req, res)
{
	
	// Is a valid SrcProc being requested?
	if (srcprocs[req.params.instance] == undefined)
	{
		res.send(404);
		return;
	}
	
	
	// Find instance of our SrcProc
	var instance = srcprocs[req.params.instance];
	
	
	// If authentication wasn't parsed, ask for it.
	if (req.auth == undefined)
	{
		res.set('WWW-Authenticate', 'Basic realm="Source Processor Authentication"');
		res.send(401);
		return;
	}

	
	Authenticator.use(req.auth.username, req.auth.password, function(err, valid)
	{
		
		// Quit if credentials aren't valid.
		if (!valid)
		{
			res.send(401);
			res.end();
			return;
		}
		
	
		instance.listJobs(req.auth.username, function(err, jobs)
		{

				res.json(jobs);
			
		});
		
		
		
	});
	
	
	
});

//~ GET /srcprocs/:instance/jobs/:jobid
//~ Returns status and output of the job. It should send the browser the no-cache header. 
//~ Return structure: { status, jobid, output }

app.get('/srcprocs/:instance/jobs/:jobid', function(req, res)
{
	
	// Is a valid SrcProc being requested?
	if (srcprocs[req.params.instance] == undefined)
	{
		res.send(404);
		return;
	}
	
	// Find instance of our SrcProc
	var instance = srcprocs[req.params.instance];
	
	
	// If authentication wasn't parsed, ask for it.
	if (req.auth == undefined)
	{
		res.set('WWW-Authenticate', 'Basic realm="Source Processor Authentication"');
		res.send(401);
		return;
	}

	
	Authenticator.verify(req.auth.username, req.auth.password, function(err, valid)
	{
		
		// Quit if credentials aren't valid.
		if (!valid)
		{
			res.send(401);
			res.end();
			return;
		}
		
		
		var jobid = req.params.jobid;
	
		instance.getJob(jobid, function(err, job)
		{
			// Quit if the authenticated user doesn't own this job.
			if (job == null || job.username != req.auth.username)
			{
				res.send(404);
				res.end()
				
			}
			
			// Otherwise, send job.
			else
			{
				
				res.format(
				{
					'text/plain': function()
					{
						// Suggest that this file be downloaded and not displayed in the browser.
						res.header('Content-Disposition', 'attachment; filename="job-output.txt"');
						
						// Send output file data of the job.
						res.send(job.outputFiles[0].data);
					},

					'application/json': function()
					{
						// Send all job info as json.
						res.json(job);
					}
					
				});
				
				
			}
		});
		
		
		
	});
	





});




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

