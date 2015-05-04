(function() {
	angular
		.module('webJCL.Authenticator',[
			'ui.bootstrap',
			'webJCL.AuthenticationModal',
		])
		.factory('Authenticator', Authenticator);

	Authenticator.$inject = ['$modal', '$q'];

	function Authenticator($modal, $q) {
		var loginID = null;
		var password = null;

		return {
			getCredentials: getCredentials,
			getLoginID: getLoginID,
			getPassword: getPassword,
			clearCredentials: clearCredentials,
			setPassword: setPassword,
		};

		function getCredentials() {
			var defer = $q.defer();

			if (loginID && password) {
				// We already have credentials

				defer.resolve({
					loginID: loginID,
					password: password,
				});
			}
			else {
				// Ask user for credentials

				var modalInstance = $modal.open({
					templateUrl: 'authenticationModal.html',
					controller: 'AuthenticationModalController',
					size: 'sm',
					resolve: {
						loginID: function() {
							return loginID;
						},
						password: function() {
							return password;
						},
					},
				});

				modalInstance.result.then(function (credentials) {
					loginID = credentials.loginID;
					password = credentials.password;

					defer.resolve(credentials);
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
					defer.reject('error');
				});
			}

		    return defer.promise;
		}

		function getLoginID() {
			return loginID;
		}

		function getPassword() {
			return password;
		}

		function clearCredentials() {
			setCredentials(null, null);
		}

		function setPassword(newPassword) {
			setCredentials(loginID, newPassword);
		}

		function setCredentials(newLoginID, newPassword) {
			loginID = newLoginID;
			password = newPassword;
		}
	}
})();