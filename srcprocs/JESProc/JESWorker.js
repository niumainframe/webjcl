fs = require('fs');
os = require('os');
path = require('path');
uuid = require('node-uuid');
spawn = require('child_process').spawn;
async = require('async');

// Obtain the EventEmitter class to interit from.
var EventEmitter = require('events').EventEmitter;

/**
 * JESWorker Constructor
 * 
 * 
 * 
 * 
 * 
 */
var JESWorker = function(file, username, password)
{
	// Call EventEmitter's constructor.
	EventEmitter.call(this);
	
	if (file == undefined)
		throw "JES has no file!";
		
	this.id = uuid.v1();
	this.file = file;
	
	this._username = username;
	this._password = password;
	
	this.tmpDir = os.tmpDir()+'/JESWorker';
	this.workspace = this.tmpDir+"/"+this.id;
	this.ready = false;
	this.time = (new Date()).getTime();
	
	this.status = '202';
	
	this.outputFiles = [];
	this.output = '';
	
	
	
	async.series(
	[
		this._createWorkspace.bind(this),
		this._writeJobFiles.bind(this),
		this._emitReady.bind(this)
	]);
	
	
}

// Officially inherit from EventEmitter
JESWorker.prototype = new EventEmitter();
JESWorker.prototype.constructor=JESWorker;


JESWorker.prototype._createWorkspace = function(callback)
{
	var worker = this;
	
	async.series(
	[
		function(next)
		{
			
			fs.exists(worker.tmpDir, function(exists)
			{
				
				if(!exists)
					fs.mkdir(worker.tmpDir, 0700, next)

				else
					next();
				
			});
			
		},
		
		function(next)
		{
			fs.mkdir(worker.workspace, 0700, next);
		}
	
	
	], callback);
	



}

JESWorker.prototype._writeJobFiles = function(callback)
{
	
	var self = this;

	
	async.series(
	[
		function(next)
		{
			// Write the JCL file to the workspace.
			fs.writeFile(self.workspace+'/'+self.file.path, self.file.data, "utf8", next)
		},
		
		
		function(next)
		{
			// Write the credentials config to the workspace.
			fs.writeFile(self.workspace+'/.JESftp.cfg', 
			"[JESftp]\nserver = zos.kctr.marist.edu\nusername = "+
			self._username+"\npassword = " + self._password, next);
			
		}
	],
		
	function(err, results)
	{
			callback();
	});
	
	
}

JESWorker.prototype._emitReady = function()
{
	this.ready = true;
	this.emit('ready', this);
}

JESWorker.prototype._destroyWorkspace = function()
{
	
	var self = this;
	
	// Obtain the list of files inside the workspace.
	var files = fs.readdir(this.workspace, function(err, files){
	
		// For each file, delete it.
		for (i in files)
		{
			fs.unlinkSync(self.workspace + '/' + files[i]);
		}
		
		// Remove directory
		fs.rmdir(self.workspace);
		
	});
	
}

JESWorker.prototype.start = function(callback)
{
	
	var self = this;
	
	
	// Obtain the full path to JESftp.py
	var JESftp_py = path.dirname(require.resolve('webjcl')) + '/JESftp.py';
	

	
	// Invoke JESftp.py with python
	var	python = spawn('python', [JESftp_py, this.workspace+'/'+this.file.path], {cwd: this.workspace});
	
	
	
	// Set things up so that we can obtain output from the script...
	// right now it's appending to the output data member of this object.
	python.stdout.setEncoding("utf8");
	python.stdout.on('data', function (data) 
	{
		self.output += data;
	});
	
	python.stderr.on('data', function (data) 
	{
		self.output += data;
	});
	
	python.stdin.write("zos.kctr.marist.edu\n"+this._username+"\n"+this._password+"\n");
	
	
	
	
	// Create a listener for when python exits.
	python.on('exit', function(stream)
	{
		
		
		
		fs.readFile(self.workspace + '/test-output.txt', "utf8", function(err, outdata)
		{
			
			
			self.outputFiles = [{path: 'test-output.txt', type: 'text/plain', data: outdata}];
			
			// TODO prepare more output
			self.status = 'done';
			
			self._destroyWorkspace();
			
			callback();
			
			
		});

		
	});
	
}

module.exports = JESWorker;
