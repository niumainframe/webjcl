var config = require("./config.js").sendmail;
var async = require("async");
var sendmail = require('sendmail')();

function createEmail(to, subject, msg)
{
	var email =
	{
		from: config.from,
		to: to,
		subject: subject,
		content: msg
	}
	
	return email;
}

function sendReport(msg, callback)
{
	
	if(config)
	{
		
		

			
			var email = createEmail(config.emails[0], "WebJCL Crash", msg);
			sendmail(email, function(a,b)
			{
				callback();
					
			});
			


		
	}
}

module.exports = sendReport;
