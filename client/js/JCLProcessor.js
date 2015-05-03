/*
 * JCLProcessor module.
 * 
 * Interface to send JCL jobs someplace to get processed.
 * 
 * Should aim to handle asm/jcl use cases instead of trying to build a
 * big ol general purpose job submitter.
 * 
 */
(function() {
	angular
		.module('webJCL.JCLProcessor',[])
		.factory('JCLProcessor', JCLProcessor);

	JCLProcessor.$inject = ['$http'];

	function JCLProcessor($http) {
		return {
			processJCL: processJCL
		};

		function processJCL(codeText, username, password) {
			return $http({
						method: 'POST',
						url: './webjcl/v2/jobs',
						headers: {
							'Authorization': 'Basic ' + window.btoa(username + ':' + password),
							'Content-Type': 'text/plain',
						},
						data: codeText,
					})
					.then(processJCLComplete)
					.catch(processJCLFailed);

				function processJCLComplete(response) {
					return response.data.output;
				}

				function processJCLFailed(error) {
					console.log("Error!");
					console.log(error);
				}
		}

	}
})();