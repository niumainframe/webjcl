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
 
// // // // // // // // // // // // // //
// Namespace WebJCL.JobPreprocessors   //
// // // // // // // // // // // // // //


define(['JobProcessing/lineProcessingDecorator'], function(lineProcessingDecorator)
{

	/**
	 * public function commentBlankLines
	 * 
	 * Given a line of text, this will comment it with a * if the line is blank.
	 * 
	 * @param string line
	 * 	The line to be analyzed.
	 *
	 * @returns mixed
	 * 	bool false: if the line does not need to be commented.
	 *  string: the commented replacement line.
	 * 
	 */
	var commentBlankLines = lineProcessingDecorator(function(line)
	{
		
		// Determine if this line containes the MACRO or MEND token and
		// change the comment character accordingly.
		
		if(/^ *MACRO *$/.test(line))
		{
			commentBlankLines._char = '.*';
		} 
		else if (/^ *MEND *$/.test(line))
		{
			commentBlankLines._char = '*';
		}
		
		// Test to see if the line is blank.
		if(/^ *$/.test(line))
		{
			return commentBlankLines._char;
		}
		
		else
		{
			return false;
		}
		
		
	});

	commentBlankLines.label = "Comment blank lines";
	commentBlankLines.description = "If a blank line is found, this will " +
	                                "replace the line with the comment symbol." +
	                                " If the MACRO token is found, it will begin" +
	                                " using the macro comment symbol until MEND" +
	                                " is found.";
	                                
	commentBlankLines._char = '*';


	return commentBlankLines;

});

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
 * 
 
var chopContinuationColumns = lineProcessingDecorator(function(line)
{
	
	// Remove everything column 71 and beyond
	line = line.slice(0, 71);
	
	return line;
	
});*/
