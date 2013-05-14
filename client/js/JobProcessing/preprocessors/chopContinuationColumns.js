/*	
 * This defines some functions inside the WebJCL.JobPreprocessors object.
 * These functions should involve the preprocessing of the text inside an
 * AceEditor.  Their signature should be as follows:
 * 
 * 	function(aceEditor)
 * 		@param aceEditor
 * 			An instance of the aceEditor one would like to perform the job
 * 			preprocessing upon.	
 * 
 * 		@returns undefined / void
 * 
 * One can assume that each preprocessing function may have the 
 * following data members available:
 * 
 * 	label: A human readable name for the preprocessor function.
 * 	description: A human readable description for the preprocessor func.
 *  
 */


define(['JobProcessing/lineProcessingDecorator'], 
function(lineProcessingDecorator)
{

	/**
	 * public function chopContinuationColumns
	 * 
	 * Given a line of text, this will return it truncated 
	 * column 72 (1-based) and beyond.
	 * 
	 * @param string line
	 * 	The line to be analyzed.
	 *
	 * @returns string
	 * 	Truncated line.
	 **/
	 
	var chopContinuationColumns = lineProcessingDecorator(function(line)
	{
		
		// Remove everything column 71 and beyond
		line = line.slice(0, 71);
		
		return line;
		
	});

	chopContinuationColumns.label = "Chop Continuation Columns";
	chopContinuationColumns.description = 
	"This removes everything from column 72 and beyond. This is convienent " +
	"because these columns were reserved for something back when this was " +
	"done on punchcards. Using these columns will cause error.";


	return chopContinuationColumns;

});


