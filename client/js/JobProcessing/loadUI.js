/*
 * loadUI module
 * 
 * contains functions that load UI aspects of job processing.
 * 
 */

define(['JobProcessing/load'], function(x) 
{
	
	// Object to be returned.	
	var loadUI = {};
	
	/* loadJobProcessors
	 * 
	 * This will look through the (pre|post) processing chains
	 * for available functions which handle job input and job output.
	 * Here it will make some sort of UI element to enable or disable them.
	 * 
	 */
	loadUI.loadJobProcessors = function() 
	{
		
		
		/* For each function in the WebJCL.JobPreprocessors object, make a checkbox
		 * that can enable or disable it. */
		 
		var collection = WebJCL.PreprocessingChain.chain;
		
		for (i in collection){
			var processor = collection[i];
			
			$("#preprocessors").append(makeCheckbox(collection, processor));
		}
		
	}
	
	
	/* Given a collection of processors and an individual processor in that 
	 * collection, this will produce an HTML checkbox element that can enable
	 * and disable the processor */
	function makeCheckbox(collection, processor) 
	{
			
			var cb = document.createElement("input");
			cb.setAttribute('type', 'checkbox');
			
			var lbl = document.createElement("label");
			$(lbl).append(cb);
			$(lbl).append(processor.label);
			$(lbl).append("<br/>");
			
			// Function that is called when the checkbox is clicked.
			$(cb).click(function(e) 
			{
				
				var addingProcessor = e.toElement.checked;
				var name = e.toElement.name;
				
				// Change the enabled flag depending on if the checkbox is checked.
				if(addingProcessor) 
				{
					
					processor.enabled = true;
					
				} 
				
				else 
				{
					
					processor.enabled = false;
					
				}
				
			});
			
			return lbl;
	}
	
	
	
	return loadUI;
	
});
