var OUTPUT_COUNT = 1;
var INPUT_COUNT = 1;
var editor;
var output;

$(document).ready(function(){
	$('#contentSpace').layout({
		east__size: 600,
		west__size: 50,
		west__initClosed: true,
	});
	editor = ace.edit("editor");
	editor.setTheme("ace/theme/webjcl");
	editor.setValue($('#input-1').text());
	output = ace.edit("output");
	output.setTheme("ace/theme/webjcl");
	output.setValue($('#output-1').text());
	
	
	$("#submit").click(function(){
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
});

var submitJob = function(){
	var user = $("#mar_username").val();
	var pass = $("#mar_password").val();
	
	if(pass == '' || user == ''){
		alert("Please specify Marist ID and password.");
		return;
	}
	
	$("#submit").attr("disabled", "disabled").find('i').removeClass('icon-play').addClass('icon-spinner').addClass('icon-spin');
	
	$.ajax('./srcprocs/JESProc/jobs', {	
		type: "POST",
		data: {
			action: "submit", 
			files: [{
				path:"test.jcl", 
				data: editor.getValue()
			}], 
			options: {
				username: user,
				password: pass
			}},
		success: function(data, status, xhr)
		{
			console.log(data);
			console.log(data.output);
			newOutput(data.files[0].data)
			
			$("#submit").removeAttr("disabled").find('i').addClass('icon-play').removeClass('icon-spinner').removeClass('icon-spin');
		}
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