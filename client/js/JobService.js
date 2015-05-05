(function() {
	angular
		.module('webJCL.JobService',[])
		.factory('JobService', JobService);

	JobService.$inject = ['$http'];

	function JobService($http) {

		return {
			getJob: getJob,
			shareJob: shareJob
		};

		function getJob(jobID) {

			return $http.get('./webjcl/v2/shared-jobs/'+jobID)
				.then(getJobComplete)
				.catch(getJobFailed);

			function getJobComplete(result) {
				return result.data;
			}

			function getJobFailed(error) {
				return {};
			}
		}

		function shareJob(job) {
			return $http({
						method: 'POST',
						url: './webjcl/v2/shared-jobs',
						headers: {
							'Content-Type': 'text/plain',
						},
						data: job,
					})
				.then(shareJobComplete)
				.catch(shareJobFailed);

			function shareJobComplete(result) {
				return result.data.id;
			}

			function shareJobFailed(error) {
				return {};
			}
		}
	}
})();