var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');


MongoClient.connect('mongodb://127.0.0.1:27017/WebJCL', 
	function(err, db)
	{
		
		var map = function() 
		{
			var timestamp = this._id.getTimestamp().getTime();
			timestamp = Math.round(timestamp / 1000)
			
			var username = this.username;
			
			emit(timestamp, 1);
		};
		
		
		var reduce = function(key, val) 
		{
			return val.length;
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
			
			var heatmapForm = {};
			
			results.forEach(function(v)
			{
				heatmapForm[v._id] = v.value;
			});
			
			var fs = require('fs');
			var fd = fs.openSync("data.json", 'w');
			fs.writeSync(fd, JSON.stringify(heatmapForm));
			fs.close(fd);
			
			process.exit();
		});
		
		


		
	});
