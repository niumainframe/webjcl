var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID
var async = require('async');

var config = require('./config.json');

var JobSet = function()
{
	var self = this;
	
	this._mongo_uri  = 'mongodb://localhost:27017/JESProc';
	this._mongo_coll = 'Jobs';
	
	// Obtain the Db
	mongodb.Db.connect(this._mongo_uri, function(err, db)
	{
		self._mongo_db = db;
	});
    
	this.set = {};

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
		console.log(job);
		
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
				id = ObjectId(id);
				
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
		
		var selector = {_id: id};
		
		
		coll.findOne(selector, function(err, result)
		{
			
			!err || console.log(err);
			
			callback(err, result);
			
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

module.exports = JobSet;
