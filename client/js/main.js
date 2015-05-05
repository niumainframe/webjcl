(function() {
	angular.module('webJCL',[
	  'ui.codemirror',
	  'btford.markdown',
	  'webJCL.JCLProcessor',
	  'webJCL.TextDownloader',
	  'webJCL.Authenticator',
	  'webJCL.CodeReference',
	])
	.controller('MainController', MainController);

	MainController.$inject = ['$scope', 'JCLProcessor', 'TextDownloader', 'Authenticator'];

	function MainController($scope, JCLProcessor, TextDownloader, Authenticator) {
		$scope.codemirrorOptions = {
			lineNumbers: true,
			autofocus: true,
			mode: 'bal',
			onLoad : function(_cm) {
				// _cm.defineSimpleMode("bal", balModeOptions);
			},
		};

		$(document).on('keypress', function(e) {
			if (e.keyCode === 13 && e.ctrlKey) {
				// CTRL + Enter
				$scope.run();
			}
		});

		$scope.run = function() {
			var willRunJob = true; // Tweaks submit button text during login
			Authenticator.getCredentials(willRunJob).then(function (credentials) {
				$scope.runningJob = true;
				JCLProcessor
					.processJCL($scope.input,credentials.loginID,credentials.password)
					.then(function(output){
						$('.tooltip').hide();
						$scope.runningJob = false;
						$scope.output = output;
					});
			}, function(error) {
				console.log("get credentials error");
				console.log(error);
			});
		};

		$scope.changeLoginAndRun = function() {
			var oldPassword = Authenticator.getPassword();
			Authenticator.setPassword(null);
			var willRunJob = true; // Tweaks submit button text during login

			Authenticator.getCredentials(willRunJob).then(function (credentials) {
				$scope.runningJob = true;
				JCLProcessor
					.processJCL($scope.input,credentials.loginID,credentials.password)
					.then(function(output){
						$scope.runningJob = false;
						$scope.output = output;
					});
			}, function(error) {
				// Login aborted; restore password
				Authenticator.setPassword(oldPassword);
			});
		};

		$scope.clearLogin = function() {
			Authenticator.setRememberSetting(false);
			Authenticator.clearCredentials();
		};

		$scope.getCurrentLoginID = function() {
			return Authenticator.getLoginID();
		}

		$scope.generateUniqueLink = function() {
			$scope.uniqueLink = "bbaabbabaabf";
			// TODO uniqueLink popover should become its own directive
			// and this setTimeout should absolutely be avoided
			setTimeout(function(){ 
				$('#uniqueLink').focus().select();   
			},0);
		};

		$scope.downloadInput = function() {
			TextDownloader.startDownloadWithText($scope.input, 'webjcl-code-');
		};

		$scope.downloadOutput = function() {
			TextDownloader.startDownloadWithText($scope.output, 'webjcl-job-');
		};

		$scope.hasLoggedIn = function() {
			return Boolean($scope.getCurrentLoginID());
		};


		// TODO: put reference into its own directive
		//$scope.reference = CodeReferenceService.getReference();
		$scope.showReference = function() {
			$scope.referenceExpanded = true;
			
			// TODO remove jquery dependencies
			function resizeReference() {
				$('#output').css({'bottom':$('#reference').height()+40+'px'});
			}
			window.addEventListener('resize', resizeReference);
			setTimeout(resizeReference,0);
		};

		$scope.hideReference = function() {
			$scope.referenceExpanded = false;
			$('#output').css({'bottom':0});
		};

	}

})();


	$(function(){
	$('[data-toggle="popover"]').popover();

	$("#resizer").draggable({
		axis: "x",
		containment: '#resizer-container',
		drag: function(event, ui) {
			$('#inputColumn').css({
				'width' : ui.position.left +'px',
			});

			$('#outputColumn').css({
				'width' : 'calc(100% - '+ parseInt(ui.position.left + 10) +'px)',
				'margin-left' : parseInt(ui.position.left + 10) +'px)',
			});
		},
	});
});