/*
 * JCLProcessor module.
 * 
 * Interface to send JCL jobs someplace to get processed.
 * 
 * Should aim to handle asm/jcl use cases instead of trying to build a
 * big ol general purpose job submitter.
 * 
 */ 
var JCLProcessor = function()
{

	this.username = "";
	this.password = "";

}


JCLProcessor.prototype = 
{
	
	/**
	 * sendJob method
	 * 
	 * @param string job_text
	 *		The text content of the JCL file
	 * 
	 * @callback function(id, output, meta) success
	 *	Upon successful job submission, this will callback with the job id, 
	 *	the output of the job, and associated metadata. If the job finished 
	 *	processing before the server sent a response, only the id won't be null.
	 *	
	 * @callback function(errMsg, data) error
	 *	If there was an error when processing the job, this will callback with
	 *	an error string describing what went wrong.
	 */
	sendJob: function(jcl_text, success, error)
	{
		
		var self = this;
		
		$.ajax('./webjcl/v2/jobs', 
		{
			type: "POST",
			
			headers: { 
				"Authorization" : "Basic " + window.btoa(self.username + ":" + self.password),
				"content-type": "text/plain"
			},
			
			data: jcl_text,
			
			success: function(data, status, xhr)
			{

				

					success(data.id, data.output, 
							// Send back some metadata too.
							{
								time: data.date,
								username: data.user
							});


			},

			error: function(data, status, xhr)
			{
				
				if (/530 PASS command failed/.test(data.responseText))
				{
					error('The mainframe rejected your credentials.	 Please reenter them and try again.');
					return;
				}
				
				else if (/file not accepted by JES/.test(data.responseText))
				{
					error('JES rejected your job.. this may be because of a bad JCL header.');
					return;
				}

				else if (/550 No jobs found/.test(data.responseText))
				{
					error('Looks like the mainframe can\'t find your job.. this is probably a problem with your KCid in the JCL header.');
					return;
				}
				
				
				self._handleUnauthorizedError(data, status, xhr, error) ||
				
				self._handleDefaultAjaxError(data, status, xhr, error);
				
			}
			
		});
	
	},
	
	/**
	 * retrieveJob method
	 * 
	 * @param id
	 *	The identifier of the job you wish to retrieve.
	 * 
	 * @callback function(output, sub, meta) success
	 *	Upon successful retrieval, this will callback with the output of the 
	 *	submission, the submission jcl file, and a metadata object.
	 *		@param string output
	 *		@param string sub
	 *		@param { time, status, username } meta
	 * 
	 * @callback function(errMsg, data) error
	 *	Upon error of sorts, this will produce an error message and additional
	 *	data from the service.
	 */
	retrieveJob: function(id, success, error)
	{
		
		var self = this;
		
		$.ajax('./webjcl/v2/jobs/'+id,
		{
			type: "GET",
			dataType: "json",
			headers: { "Authorization" : "Basic " + 
					   window.btoa(self.username + ":" + 
					   self.password) },
			
			success: function(data, status, xhr)
			{
				
				// If the job isn't complete, null output.
				// NOT TESTED

				var output = data.output;
					
				var sub = data.body;
				var meta = {
							   time: data.date,
							   username: data.user
							};
							   
				success(output, sub, meta);
				
			},
			
			error: function(data, status, xhr)
			{
					
					self._handleUnauthorizedError(data, status, xhr, error) ||
					
					self._handleDefaultAjaxError(data, status, xhr, error);
					
			}
			
		});
	
	},
	
	listJobs: function(success, error)
	{
		var self = this;
		
		$.ajax('./webjcl/v2/jobs',
		{
			type: "GET",
			dataType: "json",
			headers: { "Authorization" : "Basic " + 
					   window.btoa(self.username + ":" + 
					   self.password) },
			
			success: function(data, status, xhr)
			{
				
				success(data);
				
			},
			
			error: function(data, status, xhr)
			{
					
					self._handleUnauthorizedError(data, status, xhr, error) ||
					
					self._handleDefaultAjaxError(data, status, xhr, error);
					
			}
			
		});
		
		
	},
	
	/**
	 * private _handleDefaultAjaxError method
	 * 
	 * Given $.ajax parameters and the error callback, this will handle the 
	 * error in a generic way.
	 */
	_handleDefaultAjaxError: function(data, status, xhr, err_callback)
	{
		console.log(data);
		err_callback("Request error. See console for details.", 
		{
			"data":data,
			"status":status,
			"xhr":xhr
		});
		
		return true;
	},
	
	
	/**
	 * private _handleUnauthorizedError method
	 * 
	 * Given $.ajax parameters and the error callback, this will handle the 
	 * error.  Returns true if this handler invoked the callback, false 
	 * otherwise.
	 */
	_handleUnauthorizedError: function(data, status, xhr, err_callback)
	{
				
		// SERVER TODO: 403 or 401? which is more appropriate?
		// It seems like parts of it are sending 403s and 401s.
		
		// Case: invalid credentials
		if (data.status == 403 || data.status == 401)
		{
			err_callback("Your login information is not valid. Did you recently update your mainframe password?",
				  { "data" : data, "status" : status, "xhr" : xhr});
				  
			return true;
		}
		
		return false;
		
	}
	
}

function test()
{
	var text = $("textarea")[0].innerHTML;
	var newId = null;
	
	jcl = new JCLProcessor();
	
	jcl.username = "KC03F57";
	jcl.password = "";
	
	// send the job
	
	jcl.sendJob(text,
	
		// Success case
		function(id, output)
		{
			console.log("sendJob: success");
			console.log(id);
			newId = id;
			console.log(output);
		},
		
		// Error case
		function(errText)
		{
			console.log("sendJob: error");
			console.log(errText);
		});
	
	// end send job
	
	jcl.retrieveJob("516e2268356e8da332000001",
		function(out, sub, meta)
		{
			console.log("output: " + out);
			console.log("submimssion: " + sub);
			console.log(meta);
			
		}, function(e){console.log(e)});
	
}
