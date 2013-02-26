var mongo = require('./mongo.js');
var crypto = require('crypto');



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
			
			// Check to see if the username already exists.
			coll.findOne({ username: username }, function(err, result)
			{
				
				// If this is the case, then return false.
				if (result)
				{
					callback(err, false);
					return;
				}
					
				// Otherwise, happily insert the username/password.	
				coll.insert({ username: username, 
							  password: self.hashPass(password)}, function(err, result)
				{
					
					
					callback(err, true);
									   
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
