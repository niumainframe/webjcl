define(function()
{

	/**
	 * function lineProcessingDecorator
	 * 
	 * Decorates a line analyzing function in to be used on 
	 * all lines in an ace editor.
	 * 
	 * @param function(line) func
	 * 	The function to be called with every line currently in an ace editor.
	 *  It expects to return a string containing a replacement, or false if no
	 *  replacement is needed.
	 * 
	 * 		@param string line
	 * 			The line to analyze.
	 * 
	 * @return function(aceEditor)
	 * 	Returns a function with a signature compatable with an AceProcessingChain.
	 */
	var lineProcessingDecorator = function(func)
	{
		var decoratedFunction = function(aceEditor) 
		{
			
			var session = aceEditor.getSession();
			var document = session.getDocument();
			var rows = document.getLength();
			
			for (var l = 0; l < rows; l++)
			{
				
				var line = session.getLine(l);
				
				modifiedLine = func(line)
				
				if (!modifiedLine)
					continue;
				
				// If the return value isn't an array of lines,
				// then make it inside one.
				if (!(modifiedLine instanceof Array))
					modifiedLine = [modifiedLine]
				
				document.removeLines(l,l);
				document.insertLines(l, modifiedLine);
				
			}
		}
		
		
		return decoratedFunction;
		
	}
	
	return lineProcessingDecorator;

});
// end WebJCL.JobPreprocessors namespace.
