var config = 
{
	"port": 8000,
	"ssl_port":443,
	
	"resTimeout": 5,
	
	"ssl_enforce" : true,
	"ssl_key"  : undefined,
	"ssl_cert" : undefined,
	
	
	
	"mongodb" :
	{
		"hostname" : "localhost",
		"port"     : 27017,
		"username" : "",
		"password" : "",
		"name"     : "",
		"db"       : "db"
	},
	
	"sendmail" :
	{
		from: "WebJCL",
		emails:[],
		phones:[]
	}
	
};


// If AppFog
if(process.env.VCAP_SERVICES != undefined)
{
	config.port = process.env.VCAP_APP_PORT;
	
	// Set up mongo.
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var mongo = env['mongodb-1.8'][0]['credentials'];
	
	config.mongodb = mongo;
	
}


module.exports = config;
  
