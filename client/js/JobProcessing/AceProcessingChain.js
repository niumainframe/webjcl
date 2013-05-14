
define(function()
{
	
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
	var AceProcessorChain = function()
	{
		this.chain = [];
	}
	
	
	AceProcessorChain.prototype = {
	
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
				// Invoke the function with the aceEditor if it is enabled.
				if (this.chain[i].enabled)
					this.chain[i](aceEditor)
			}
		}
		
	
	}
	
	
	return AceProcessorChain;
	
});
	






