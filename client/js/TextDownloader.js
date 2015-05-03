(function() {
	angular
		.module('webJCL.TextDownloader',[])
		.factory('TextDownloader', TextDownloader);

	TextDownloader.$inject = ['$filter'];

	function TextDownloader($filter) {
		return {
			startDownloadWithText: startDownloadWithText
		};

		function startDownloadWithText(text, filenamePrepend) {
			text = fixWindowsLineEndings(text);
			createAndNavigateToFile(text, filenamePrepend);
		}

		function fixWindowsLineEndings(text) {
			/* linefeed / line ending fix
			 * downloaded output does not look formatted correctly on windows. */
			if (window.navigator.platform.match('Win32')) {
				// Feed a new string characters from the old string
				var windowstext = "";
				for (k in text) {
					// If we come across a LF
					if (text[k] == '\n') {
						// Feed the new string a CR before the LF.
						windowstext += '\r';
						windowstext += '\n';
					}
					else {
						windowstext += text[k];
					}

				}
				
				// Replace the old string with the new one.
				text = windowstext;
			}
			return text;
		}

		function createAndNavigateToFile(text, filenamePrepend) {
			// Create the blob of the code.
			text = text.split(''); // Split text into a character array.
			var blob = new Blob(text, {type: "application/octet-stream"});
			var url = window.URL.createObjectURL(blob);

			var anchorElement = document.createElement('a');
			document.body.appendChild(anchorElement);
			anchorElement.style = 'display:none';
			anchorElement.href = url;
			anchorElement.download = filenamePrepend + getDateForFileName() + '.txt';
			anchorElement.click();
			window.URL.revokeObjectURL(url);
		}

		function getDateForFileName() {
			return $filter('date')(new Date(), 'yyyy-MM-dd--HH.mm.ss')
		}

	}
})();