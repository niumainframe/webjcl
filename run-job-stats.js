/* Usage: 
	node run-job-stats.js > stats.txt
 * Produces tab delimited data about the "Jobs" collection
 * in mongodb running on localhost:27017.
 */ 

var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');


MongoClient.connect('mongodb://127.0.0.1:27017/WebJCL', 
	function(err, db)
	{
		
		var map = function() 
		{
			var timestamp = this._id.getTimestamp();

			var month = timestamp.getMonth()+1;
			var day = timestamp.getDate();
			var year = timestamp.getFullYear();
			
			
			
			emit({ month: month, 
			 day: day, 
			 year:  year}, {count: 1, user:this.username})
		};
		
		
		var reduce = function(key, val) 
		{

			var count = 0;
			
			var userArr = [];
			
			val.forEach(function(v)
			{

				count += v['count'];
				
				if(userArr.indexOf(v.user) === -1)
				{
					userArr.push(v.user);
				}
			
			
			});

			return { 
				count: count, 
				users: userArr.length };

		}
		
		
		var MR = {
			mapreduce: "Jobs", 
			out:  { inline : 1 },
			map: map.toString(),
			reduce: reduce.toString()
		}

		db.executeDbCommand(MR, function(err, dbres)
		{
			
			var results = dbres.documents[0].results;
			
			console.log('Date\tJobs\tUsers');
			
			_.each(results, function(val){
				console.log(
					val._id.year + '-' +
					val._id.month + '-' + 
					val._id.day + '\t' +
					val.value.count + '\t' +
					val.value.users);
			});
			
			process.exit();
			
		})
		
		


		
	});
