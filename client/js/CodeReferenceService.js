(function() {
	angular
		.module('webJCL.CodeReferenceService',[])
		.factory('CodeReferenceService', CodeReferenceService);

	CodeReferenceService.$inject = ['$http'];

	function CodeReferenceService($http) {

		return {
			getReferenceGroups: getReferenceGroups
		};

		function getReferenceGroups() {
			return $http.get('codeReference.json')
				.then(getReferenceGroupsComplete)
				.catch(getReferenceGroupsFailed);

			function getReferenceGroupsComplete(responseJson) {
				return responseJson;
			}

			function getReferenceGroupsFailed(error) {
				return [];
			}
		}
	}
})();