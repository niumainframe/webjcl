(function() {
	angular
		.module('webJCL.Authenticator',[
			'ui.bootstrap',
			'webJCL.AuthenticationModal',
			'LocalStorageModule',
		])
		.factory('Authenticator', Authenticator);

	Authenticator.$inject = ['$modal', '$q', 'localStorageService'];

	function Authenticator($modal, $q, localStorageService) {
		var STORAGE_KEY_LOGIN_ID = 'webJCLloginID';
		var STORAGE_KEY_PASSWORD = 'webJCLpassword';
		var STORAGE_KEY_REMEMBER_SETTING = 'webJCLrememberCredentialsSetting';

		var loginID = shouldRememberCredentials()
						? localStorageService.get(STORAGE_KEY_LOGIN_ID)
						: null;
		var password = shouldRememberCredentials()
						? localStorageService.get(STORAGE_KEY_PASSWORD)
						: null;

		return {
			getCredentials: getCredentials,
			getLoginID: getLoginID,
			getPassword: getPassword,
			clearCredentials: clearCredentials,
			setPassword: setPassword,
			setRememberSetting: setRememberSetting,
		};

		function getCredentials(willRunJob) {
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
						willRunJob: function() {
							return willRunJob;
						}
					},
				});

				modalInstance.result.then(function (result) {
					setRememberSetting(result.remember);
					setCredentials(result.loginID, result.password);

					defer.resolve({
						loginID: getLoginID(),
						password: getPassword(),
					});
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

			if (shouldRememberCredentials()) {
				localStorageService.set(STORAGE_KEY_LOGIN_ID, loginID);
				localStorageService.set(STORAGE_KEY_PASSWORD, password);
			}
		}

		function setRememberSetting(shouldRemember) {
			localStorageService.set(STORAGE_KEY_REMEMBER_SETTING, shouldRemember);
			
			if (!shouldRemember) {
				localStorageService.remove(STORAGE_KEY_LOGIN_ID);
				localStorageService.remove(STORAGE_KEY_PASSWORD);
			}
		}

		function shouldRememberCredentials() {
			console.log("Should remember?");
			console.log(localStorageService.get(STORAGE_KEY_REMEMBER_SETTING));
			return localStorageService.get(STORAGE_KEY_REMEMBER_SETTING);
		}
	}
})();