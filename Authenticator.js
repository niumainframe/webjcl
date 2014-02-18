var mongo = require('./mongo.js');
var crypto = require('crypto');
var ftp = require("ftp");



var Authenticator = 
{
	collection : 'Credentials',
	
	
	verify: function(username, password, callback)
	{
		
		// Ensure callable callback.
		if (callback == undefined)
			callback = function(){};
		
		var self = this;
		
		mongo.collection(self.collection, function(err, coll)
		{
			
			coll.findOne({ username: username, 
			               password: self.hashPass(password)}, function(err, result)
			{
				
				if(result == null)
					callback(err, false);
				
				else
				{
					callback(err, true);
				}
							   	   
			});
			
			
			
			
		});
	
	
	},
	
	register: function(username, password, callback)
	{
		
		// Ensure callable callback.
		if (callback == undefined)
			callback = function(){};
		
		var self = this;
		
		mongo.collection(self.collection, function(err, coll)
		{
			
			// Drop any entry of the username in the table.
			coll.remove({ username: username }, function(err, result)
			{
				
				// Verify that the credentials match the ones on marist.
				// TODO: THIS IS OUT OF PLACE.
				// The structure of the authentication system probably needs to
				// be rethunk.
				ftpClient = new ftp();
				jesConf = require('./srcprocs/JESProc/config.js');
				ftpClient.connect({"host": jesConf.host, "port": jesConf.port, "user": username, "password": password});
				
				// CASE: successful login
				ftpClient.on('ready', function()
				{
					// close ftp connection
					ftpClient.end();
					
					// Happily insert the username/password into our database.
					coll.insert({ username: username, 
								  password: self.hashPass(password)}, function(err, result)
					{
						callback(err, true);
										   
					});
					
				});
				
				// CASE: login  failed.
				ftpClient.on('error', function()
				{
					callback(err, false);
					return;
				});
				
				
			});
			

			

		});
		
		
	},
	
	use: function(username, password, callback)
	{
		
		// Ensure callable callback.
		if (callback == undefined)
			callback = function(){};
		
		
		
		var self = this;
		
		self.verify(username, password, function(err, result)
		{
			if(!result)
			{
				
				self.register(username, password, function(err, result)
				{
					callback(err, result);
				});
				
			}
			
			else
			{
				
				callback(err, !err);
				
			}
			
			
		});
		
		
	},
	
	
	hashPass: function(password, salt)
	{
		// Create hashed owner
		// TODO: SALT
		var hash = crypto.createHash('sha1');
		hash.update(password+salt);
		var hashedCredentials = hash.digest('hex');

		return hashedCredentials;
	}
	
	
}

module.exports = Authenticator;
