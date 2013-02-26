
var mongodb = require('../../mongo.js');
var ObjectId = require('mongodb').ObjectID
var async = require('async');

var config = require('./config.json');

var ISrcProcJob = require('../../framework/ISrcProcJob.js');

var JobSet = function()
{
	var self = this;
	
	this._mongo_db = mongodb;
	
	
	this._mongo_coll = 'Jobs';
    
	this.set = {};
	
	
	// Remove completed jobs from the memory set every 5 minutes.
	setInterval(function()
	{
		self._pruneJobs();	
	}, 5*60*1000);

}


JobSet.prototype.addJob = function(job, callback)
{
	var self = this;
	
	console.log("Adding Job: ");
	
	// With the "Job" collection.
	self._mongo_db.collection(this._mongo_coll, function(err, coll)
	{
		
		!err || console.log(err);
		
		// Insert the job object
		coll.insert(job.getStruct(), function(err, records)
		{
			
			if (err)
				console.log(err);
			
			// Return with the id of the inserted document.
			else
			{
				
				job.setID(records[0]._id);
				
				self.set[job.id] = job;
				
				callback(err, records[0]._id);
				
			}
			
		});
	
	});
	
}

JobSet.prototype.updateJob = function(job)
{
	var self = this;
	
	console.log("Updating Job: ");
	
	// With the "Job" collection.
	self._mongo_db.collection(this._mongo_coll, function(err, coll)
	{
		
		!err || console.log(err);
		
		
		job = job.getStruct();
		
		// Insert the job object
		coll.save(job, function(err, record)
		{
			
			
			
			
			if (err)
				console.log(err);
			
			// Return with the id of the inserted document.
			else
			{
				
				self.set[job.id] = job;
				
			}
			
		});
	
	});
	
}


JobSet.prototype.getJob = function(id, callback)
{
	var self = this;
	
	
	if(this.set[id] != undefined)
	{
		callback(null, this.set[id]);
	}
	
	else
	{
		console.log("Obtaining Job from Mongo");
		self._mongo_db.collection(this._mongo_coll, function(err, coll)
		{
			!err || console.log(err);
			
			
			if (!(id instanceof ObjectId))
			{
				try
				{
					id = ObjectId(id);
				}
				
				catch (e)
				{
					// Assuming that a bad ID was passed: not found it.
					callback(null, null);
				}
			}
				
			var selector = {_id: id };
			
			
			

			coll.findOne(selector, function(err, result)
			{
				
				!err || console.log(err);
				
				callback(err, result);
				
			});
			
		});
	
	}
	
}


JobSet.prototype.listJobs = function(user, callback)
{
	
	var self = this;
	
	self._mongo_db.collection(this._mongo_coll, function(err, coll)
	{
		!err || console.log(err);
		
		var selector = {username: user};

		coll.find(selector, {id:"", time:"", username: ""},{limit: 5, sort: {id:-1}}, function(err, result)
		{
			
			!err || console.log(err);
			
			result.toArray(function(err, array)
			{
				
				callback(err, array);
				
			});
			
			
			
		});
		
	});
}


JobSet.prototype._assertSchema = function()
{
	var self = this;
	
	self._mongo_db.collectionNames(function(error, names)
	{
		
		console.log(names);
		
	});
	

}


JobSet.prototype._pruneJobs = function()
{
	// Prune memory set
	for (j in this.set)
	{
		
		if (this.set[j].status == ISrcProcJob.statusCode.done)
		{
			delete this.set[j];
		}
		
	}
	
	/*
	console.log("pruning");
	this._mongo_db.collection(this._mongo_coll, function(err, coll)
	{
		
		coll.distinct("username", function(err, usernames)
		{
			
			async.eachSeries(usernames,
			function(item, callback)
			{
				
				var username = item;
				
				console.log("pruning " + username);
				
				coll.find({username:username},{_id:""}, function(err, cursor)
				{
					
					cursor.count(function(err, cnt)
					{
						
						console.log({username:username+' '+cnt});
						
						if(cnt > 5)
						{
							
							coll.find({username:username},
									  [['time',1]],
									  {limit:(cnt-5)}, function(err, result)
							{
								
								result.each(function(err, item){console.log(item)});
								callback();
								
							});
						
						}
						
						else 
						
						callback();
						
					});
					
				});				
				
			},
			function(err)
			{
				
				console.log('done');
				
			}); //async.eachSeries

		}); // coll.distinct
		
	}); // db.collection
	
	*/
	
}
module.exports = JobSet;
