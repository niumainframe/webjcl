(function() {
	angular
		.module('webJCL.CodeReference',[
			'webJCL.CodeReferenceService',
		])
		.directive('codeReference', codeReference);

	codeReference.$inject = ['CodeReferenceService'];

	function codeReference(CodeReferenceService) {
		var directive = {
			link: link,
			templateUrl: 'codeReference.html',
			restrict: 'E'
		};
		return directive;

		function link(scope, element, attrs) {
			CodeReferenceService.getReferenceGroups().then(function(result){
				scope.groups = result.data;

				// For readability, item description and example may optionally be split into an 
				// array of  multiple strings to allow them to span multiple lines in the code 
				// reference JSON. Join these back together as strings if that is the case.
				for (var i = 0; i < scope.groups.length; i++) {
					for (var j = 0; j < scope.groups[i].items.length; j++) {
						if (scope.groups[i].items[j].description instanceof Array) {
							scope.groups[i].items[j].description = scope.groups[i].items[j].description.join('');
						}

						if (scope.groups[i].items[j].example instanceof Array) {
							scope.groups[i].items[j].example = scope.groups[i].items[j].example.join('');
						}
					}
				}
			});
		}
	}
})();