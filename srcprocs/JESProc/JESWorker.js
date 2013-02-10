fs = require('fs');
os = require('os');
path = require('path');
uuid = require('node-uuid');
spawn = require('child_process').spawn;

var JESWorker = function(file, username, password)
{
	
	if (file == undefined)
		throw "JES has no file!";
		
	this.id = uuid.v1();
	this.file = file;
	
	this._username = username;
	this._password = password;
	
	this.tmpDir = os.tmpDir()+'/JESWorker';
	this.workspace = this.tmpDir+"/"+this.id;
	this.time = (new Date()).getTime();
	
	this.status = '202';
	
	this.outputFiles = [];
	this.output = '';
	
	
	this._createWorkspace();
	
	
}

JESWorker.prototype._createWorkspace = function()
{
	var self = this;
	
	
	// Ensure that we have a tmp directory.
	if (!fs.existsSync(this.tmpDir))
	{ 
		fs.mkdir(this.tmpDir, 0700);
	}
	
	// Attempt to make the workspace.
	fs.mkdir(this.workspace, 0700);

	
	
	// Write the JCL file to the workspace.
	fs.writeFile(this.workspace+'/'+this.file.path, this.file.data);
	
	// Write the credentials config to the workspace.
	fs.writeFile(this.workspace+'/.JESftp.cfg', 
		"[JESftp]\nserver = zos.kctr.marist.edu\nusername = "+
		this._username+"\npassword = " + this._password);
	
	
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
