var OUTPUT_COUNT = 1;
var INPUT_COUNT = 1;
var username = '';
var password = '';
var codePTO;
var outputPTO;

var jclProcessor = new JCLProcessor();

$(document).ready(function(){
	$('#ide-page').show();
	$('#contentSpace').layout({
		east__size: 600,
		west__size: 50,
		west__initClosed: true,
	});
	$('#ide-page').hide();
	$('#account-page').show();
	
	
	$('#run-button').click(function(){
		submitJob();
	});
	
	$('#account').click(function(){
		var parent = $(this).parent();
		if(parent.hasClass('toggled'))
			parent.removeClass('toggled');
		else
			parent.addClass('toggled');
	});
	
	$('#outputTabs > li').on('click', function(){
		var item = $(this);
		if(!item.hasClass('selected')){
			var old_id = $('#outputTabs > .selected').removeClass().attr('data-id');
			var new_id = item.addClass('selected').attr('data-id');
			$('#output-' + old_id).text(output.getValue());
			output.setValue($('#output-' + new_id).text());
		}
	});
	
	$('#ide').click(function(){
		var e = $(this);
		if(e.hasClass('selected') == false){
			$('.page').hide();
			$('#ide-page').show();
			$('#menu').find('.selected').removeClass('selected');
			e.addClass('selected');
		}
	});	
	
	$('#account').click(function(){
		var e = $(this);
		if(e.hasClass('selected') == false){
			$('.page').hide();
			$('#account-page').show();
			$('#menu').find('.selected').removeClass('selected');
			e.addClass('selected');
		}
	});	
	
	$('#feedback').click(function(){
		var e = $(this);
		if(e.hasClass('selected') == false){
			$('.page').hide();
			$('#feedback-page').show();
			$('#menu').find('.selected').removeClass('selected');
			e.addClass('selected');
		}
	});
	
	$('#saveAccount').click(function(e){
		e.preventDefault();
		if($('#username').val() == '' || $('#password').val() == ''){
			alert("Please specify Marist ID and password.");
			return;
		}
		username = $('#username').attr('disabled','disabled').val();
		password = $('#password').attr('disabled','disabled').val();
		
		// Configure jclProcessor
		jclProcessor.username = username;
		jclProcessor.password = password;
		
		$('#ide').removeAttr('disabled');
		$(this).attr('disabled','disabled');
		$('#changeAccount').removeAttr('disabled');
		
		// Obtain the jobs.
		jclProcessor.listJobs(
			
			// Success
			function(jobs) {
				
				// For each job...
				for(var i = jobs.length-1; i >= 0; i--) {
					
					jclProcessor.retrieveJob(jobs[i].id, 
					
						// Success
						function(output, sub, meta){
							
							// Place output in a new tab.
							var index = codePTO.createTextObject('Saved');
							codePTO.getByIndex(index).editor.setValue(sub);
							
						},
						
						// Error
						function(errMsg, data) {
							
							alert(errMsg);
							console.log(data);
							
							
						});
					
				}
					
			},
			
			// listJobs error.
			function(errMsg, data) {
				
				alert(errMsg);
				console.log(data);
				
			});
		
		// Switch to IDE section by clicking it's button.
		var ideBtn = document.getElementById("ide");
		if (typeof ideBtn.onclick == "function") {
			ideBtn.onclick.apply(ideBtn);
		}
		
		ideBtn.click();
		
	});	
	
	$('#changeAccount').click(function(e){
		e.preventDefault();
		$('#username').val('').removeAttr('disabled');
		$('#password').val('').removeAttr('disabled');
		$('#ide').attr('disabled','disabled');
		$(this).attr('disabled','disabled');
		$('#saveAccount').removeAttr('disabled');
	});
	
	$('.tabsContainer').mousewheel(function(event,delta){
		var elem = $(this).find('ul.tabs');
		if (delta > 0) {
			if(parseInt(elem.css('left')) < 0){
				var calc = parseInt(elem.css('left'))+40;
				elem.css('left', calc);
			}
		} else {
			var calc = parseInt(elem.css('left'))-40;
			if(calc + elem.outerWidth() > $(this).width()-39){
				elem.css('left', calc);
			}
		} 
	}); 
	
	//Assign the TO managers to the respective panels.
	codePTO = new TextObjectManager('code',$('#codePanel'));
	outputPTO = new TextObjectManager('output',$('#outputPanel'));
	
	$('#new-button').click(function(e){
		codePTO.createTextObject('Program');
	});
	
	$('#save-output-button').click(function(e){

		downloadActiveTO(outputPTO);
		
	});
	
	$('#save-code-button').click(function(e){

		downloadActiveTO(codePTO);
		
	});
	
});




var submitJob = function(){
	if(username == '' || password == ''){
		alert("Please specify Marist ID and password.");
		return;
	}
	

	// Set credentials.
	jclProcessor.username = username;
	jclProcessor.password = password;
	
	var textObject = codePTO.getActive();
	if(!textObject){
		alert("You must have an active tab in order to run a program.");
		return;
	}

	var text = textObject.editor.getValue();
	
	$('#run-button').attr('disabled', 'disabled').find('i').removeClass('icon-play').addClass('icon-spinner').addClass('icon-spin');
	
	
	jclProcessor.sendJob(text,
		// Success callback
		function(id, output, meta) {
			
			// CASE: No Output:
			if (output == null) {
				
				// Begin polling for the job to complete.
				pollForOutput(id);
				
			}
			
			// CASE: We have output!
			else {
				// Make a new output text object with the job's contents.
				makeNewOutputTO(output, 'Output');
				
				// Restore button
				$('#run-button').removeAttr('disabled').find('i').addClass('icon-play').removeClass('icon-spinner').removeClass('icon-spin');
			}
		},
		
		// Error callback
		function(errMsg, data) {
			
			alert(errMsg);
			console.log(data);
			// Restore button
			$('#run-button').removeAttr('disabled').find('i').addClass('icon-play').removeClass('icon-spinner').removeClass('icon-spin');
		
		}); //end jclProcessor.sendJob
		
}; //end submitJob(..)

var newOutput = function(output){
	$('#outputStorage').append('<li id="output-' + OUTPUT_COUNT + '>' + output + '<li>');
	$('#outputTabs').append('<li id="outputTab-' + OUTPUT_COUNT + ' data-id="' + OUTPUT_COUNT + '">Output ' + OUTPUT_COUNT + '<li>');
	OUTPUT_COUNT++;
	output.setValue($('#output-' + OUTPUT_COUNT).text());
	$('#outputTabs > li.selected').removeClass('selected');
	$('#output-' + OUTPUT_COUNT).addClass('selected')
}


/**
 * makeNewOutputTO
 * 
 * Make new output text object.
 * 
 * @param string content
 * 	The textual content to place in the text object.
 * @param string name
 * 	The name of the tab
 */
var makeNewOutputTO = function(content, name) {
	
	var index = outputPTO.createTextObject(name);
	var o = outputPTO.getByIndex(index);
	o.editor.setValue(content);
	
	// make it read only
	o.editor.setReadOnly(true);
	
}

/**
 * pollForOutput
 * 
 * Given a job ID, this will wait for a period of time and attempt to retrieve
 * the job.  If the output is null, then it will wait for a period of time and
 * try again.
 * 
 * Upon success it makes a new output pane with the content.
 * 
 * Errors are alerted and logged.
 * 
 * This function is intended to be used when the job processor returns no output
 * but the job has been assigned an ID. (Usually this is when the job is taking
 * too long to process and one should check back later.)
 * 
 * @param job_id id
 * 	The id of the job to retrieve.
 * 
 */
var pollForOutput = function(id) {
	
	console.log("Did not receive job immediately.. will poll again soon...");
	
	// How many ms should we wait before trying to get the job?
	var timeout = 5000;
	
	// Invoke this function in X ms from now.
	setTimeout(function() {
		
		// Try to get the job.
		jclProcessor.retrieveJob(id, 
			
			// Success case
			function(output, sub, meta)
			{
				
				if(output == null)
					// Try again later if still no output.
					pollForOutput(id);
				
				
				else
					// Show the output!
					makeNewOutputTO(output, "Output");
				
				// Restore button
				$('#run-button').removeAttr('disabled').find('i').addClass('icon-play').removeClass('icon-spinner').removeClass('icon-spin');
				
			},
			
			// Error case
			function(errMsg, data)
			{
				alert(errMsg);
				console.log(data);
				
			});
		
	}, timeout);
	
}

/**
 * getTextDownloadURL
 * 
 * Given a string of text, this will produce a local URL to where the text can
 * be downloaded.
 * 
 * @param string text
 * 	The text to be made available by local URL.
 * 
 */
var getTextDownloadURL = function(text){
	
	// Split text into a character array.
	text = text.split('');
	
	// Create the blob of the code.
	var blob = new Blob(text, {type: "application/octet-stream"});
	
	// Obtian URL to the blob.
	var fileURL = window.URL.createObjectURL(blob);
	
	return fileURL;
	
}

/**
 * downloadActiveTO
 * 
 * This will present a download prompt to download the contents of the 
 * currently active TO from the specified TO manager.  It currently doesn't
 * do anything if there is no active TO.
 * 
 * @param TextObjectManager manager
 * 	Instance of a TextObjectManager
 * 
 */
var downloadActiveTO = function(manager) {
	
	var textObject = manager.getActive()
	
	// Quit if there is no active text object.
	if(!textObject)
		return false;
	
	// Obtain the text of the output.
	var text = textObject.editor.getValue();
	
	/* linefeed / line ending fix
	 * downloaded output does not look formatted correctly on windows. */
	if (window.navigator.platform.match('Windows'))
	{
		// Feed a new string characters from the old string
		var windowstext = "";
		for (k in text) 
		{
			// If we come across a LF
			if (text[k] == '\n')
			{
				// Feed the new string a CR before the LF.
				windowstext += '\r';
				windowstext += '\n';
			}
			
			else
				windowstext += text[k];
			
		}
		
		// Replace the old string with the new one.
		text = windowstext;
	}
	
	
	// Navigate browser to the URL of the text.
	window.location = getTextDownloadURL(text);
	
}
