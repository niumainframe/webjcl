/**
 * lineProcessingDecorator
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

/**
 * commentBlankLine
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
var commentBlankLine = function(line)
{
	
	if(/^ *$/.test(line))
	{
		return '*';
	}
	
	else
	{
		return false;
	}
	
	
}

/**
 * chopContinuationColumn
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
 */
var chopContinuationColumn = function(line)
{
	
	// Remove everything column 71 and beyond
	line = line.slice(0, 71);
	
	return line;
	
}

// Decorate line handling functions into AceProcessingChain delegates.
var chopAllContinuationColumns = lineProcessingDecorator(chopContinuationColumn);
var commentAllBlankLines = lineProcessingDecorator(commentBlankLine);


/**
 * AceProcessingChain class
 * 
 * Register functions to work with and potentially 
 * modify the contents of an ace editor.
 * 
 * Currently this works properly with functions with the following signature:
 * 	void function(aceEditor)
 * 
 * Simply add the reference to the function in the chain datamember.
 * 
 */
var AceProcessingChain = function()
{
	this.chain = [];
}

AceProcessingChain.prototype = {
	
	/**
	 * AceProcessingChain.invoke
	 * 
	 * Invokes the chain of processors
	 * 
	 * @param ace.Editor aceEdtior
	 * 	An instance of an ACE editor you would like to apply 
	 * 	the processing chain upon.
	 */
	invoke: function(aceEditor)
	{
		for (i in this.chain)
		{
			this.chain[i](aceEditor)
		}
	}
	
}

function test()
{
	
	var inputChain = new AceProcessingChain();
	
	inputChain.chain.push(chopAllContinuationColumns);
	inputChain.chain.push(commentAllBlankLines);
	
	inputChain.invoke(editor);
	
	
}
