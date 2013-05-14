/* main-requirejs.js
 * 
 * This file is the main entry point for code 
 * that uses the require.js import scheme.
 * 
 * 
 */

require(["JobProcessing/AceProcessingChain", 
         "JobProcessing/load", 
         "JobProcessing/loadUI"], function(x,y, loadUI) 
{
	
	loadUI.loadJobProcessors();
	// // // // // // // //
	// Namespace WebJCL  //
	// // // // // // // //
	(function( WebJCL, $, undefined ) {


		//WebJCL.PreprocessingChain = new AceProcessorChain();
		//WebJCL.PostprocessingChain = new AceProcessorChain();
		
		// Perhaps the primary JobProcessor can be defined here.

	}( (window.WebJCL = window.WebJCL || {}), jQuery ));
	
	
	
    
});


