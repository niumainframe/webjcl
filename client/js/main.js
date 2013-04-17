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
		$('#ide').removeAttr('disabled');
		$(this).attr('disabled','disabled');
		$('#changeAccount').removeAttr('disabled');
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
});

var submitJob = function(){
	if(username == '' || password == ''){
		alert("Please specify Marist ID and password.");
		return;
	}
	

	
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
			
			var index = outputPTO.createTextObject('Output');
			var o = outputPTO.getByIndex(index);
			o.editor.setValue(output);
			
			// Restore button
			$('#run-button').removeAttr('disabled').find('i').addClass('icon-play').removeClass('icon-spinner').removeClass('icon-spin');
			
		},
		
		// Error callback
		function(errMsg, data) {
			
			alert(errMsg);
			console.log(data);
			// Restore button
			$('#run-button').removeAttr('disabled').find('i').addClass('icon-play').removeClass('icon-spinner').removeClass('icon-spin');
		
		});
};

var newOutput = function(output){
	$('#outputStorage').append('<li id="output-' + OUTPUT_COUNT + '>' + output + '<li>');
	$('#outputTabs').append('<li id="outputTab-' + OUTPUT_COUNT + ' data-id="' + OUTPUT_COUNT + '">Output ' + OUTPUT_COUNT + '<li>');
	OUTPUT_COUNT++;
	output.setValue($('#output-' + OUTPUT_COUNT).text());
	$('#outputTabs > li.selected').removeClass('selected');
	$('#output-' + OUTPUT_COUNT).addClass('selected')
}
