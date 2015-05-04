(function() {
	angular.module('webJCL',[
	  'ui.codemirror',
	  'webJCL.JCLProcessor',
	  'webJCL.TextDownloader',
	  'webJCL.Authenticator',
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

		$scope.input = "\
	//KCO2298A JOB ,'CAROLYN',MSGCLASS=H\n\
	//STEP1  EXEC PGM=ASSIST\n\
	//STEPLIB DD DSN=KC02293.ASSIST.LOADLIB,DISP=SHR\n\
	//SYSPRINT DD SYSOUT=*\n\
	//SYSIN DD *\n\
	        TITLE 'PROGRAM 2'\n\
	***********************************************************************\n\
	* Name:               CSCI 360 Program 2                              *\n\
	*                                                                     *\n\
	* Function:   This program will calculate profit for each car, total  *\n\
	*********10****16****************34************************************\n\
	        EJECT ,\n\
	PROGRAM2 CSECT ,                 Define PROGRAM2 as control section\n\
	        USING PROGRAM2,15       Base register is 15\n\
	*\n\
	* 1) Print headers for output table, zero registers\n\
	*\n\
	        XPRNT HEADER1,47        Print ACME header\n\
	        XPRNT HEADER2,47        Print report header\n\
	        XPRNT CLMNS,73          Print column names\n\
	        XPRNT LINE,132          Print separting line of dashes\n\
	        SR    6,6               Zero total cars\n\
	        SR    7,7               Zero total cost\n\
	        SR    8,8               Zero total age\n\
	        SR    9,9               Zero total profit\n\
	*\n\
	* 2) Primary read of data and start loop until end of input file read\n\
	*\n\
	        XREAD CARD,80           Read first Card\n\
	CHECKEOF BC    B'0100',EXIT      If end of file exit the program\n\
	*\n\
	* 3) Process the data\n\
	*\n\
	        XDECI 2,CARD            Read the Car stock # into Reg. 2\n\
	        XDECI 3,0(1)            Read the Price Purchased into Reg. 3\n\
	        XDECI 4,0(1)            Read the Price Sold into Reg. 4\n\
	        XDECI 5,0(1)            Read the Age into Reg. 5\n\
	*\n\
	        LR    10,4              Load Sold price into another register\n\
	        SR    10,3              To hold the profit (SOLD-COST)\n\
	*\n\
	        A     6,=F'1'           Increment number of total cars\n\
	        AR    7,3               Add single car cost to the total cost\n\
	        AR    8,5               Add single car age to the total age\n\
	        AR    9,10              Add single car profit to total profit\n\
	*\n\
	* 4) Print data for output table\n\
	*\n\
	        XDECO 2,STOCKNUM        Put printable form stock in Printout1\n\
	        XDECO 3,COST            Put printable form cost in Printout1\n\
	        XDECO 4,SOLD            Put printable form sold in Printout1\n\
	        XDECO 5,AGE             Put printable form age in Printout1\n\
	        XDECO 10,PROFIT         Put printable form profit in Prinout1\n\
	        XPRNT PRNTOUT1,61       Print Printout1 of info for each car\n\
	*\n\
	* 5) Branch back to the top of the loop\n\
	*\n\
	        XREAD CARD,80           Secondary read of card\n\
	        BC    B'1111',CHECKEOF  Go check again for end of file\n\
	*\n\
	* 6) Output the summary data and exit the program\n\
	*\n\
	EXIT     XDECO 6,TOTLCARS        Put printable form in NUMCARS\n\
	        XPRNT NUMCARS,51        Print total number of cars\n\
	        XDECO 7,TOTLCOST        Put printable form in NUMCOST\n\
	        XPRNT NUMCOST,51        Print total cost of cars\n\
	        XDECO 8,TOTLAGE         Put printable form in NUMAGE\n\
	        XPRNT NUMAGE,51         Print total age of cars\n\
	        XDECO 9,TTLPRFIT        Put printable form in NUMPRFIT\n\
	        XPRNT NUMPRFIT,51       Print total profit\n\
	        BCR   B'1111',14        End program\n\
	        LTORG\n\
	*\n\
	* Storage Data\n\
	*\n\
	CARD     DS    CL80                    Card input area\n\
	HEADER1  DC    CL30'1'                 ACME header\n\
	        DC    C'ACME CAR COMPANY'\n\
	HEADER2  DC    CL30' '                 Report header\n\
	        DC    C'QUARTERLY REPORT'\n\
	CLMNS    DC    C'0STOCK #           '  Column names\n\
	        DC    C'COST               '\n\
	        DC    C'SOLD           '\n\
	        DC    C'AGE           PROFIT'\n\
	LINE     DC    C' '                    Line of dashes\n\
	        DC    132C'-'\n\
	*\n\
	PRNTOUT1 DC    C'0'                    Printout each car info\n\
	STOCKNUM DS    CL12                    storage for Stock number\n\
	COST     DS    CL12                    storage for Cost\n\
	SOLD     DS    CL12                    storage for Price sold\n\
	AGE      DS    CL12                    storage for Age of car\n\
	PROFIT   DS    CL12                    storage for Profit of car\n\
	*\n\
	NUMCARS  DC    CL20' '                 Print total number of cars\n\
	        DC    C'NUMBER OF CARS:   '\n\
	TOTLCARS DS    CL12                    storage for total number of cars\n\
	NUMCOST  DC    CL20' '                 Print total cost of all cars\n\
	        DC    C'TOTAL COST:       '\n\
	TOTLCOST DS    CL12                    storage for total cost of cars\n\
	NUMAGE   DC    CL20' '                 Print total age of all cars\n\
	        DC    C'TOTAL AGE:        '\n\
	TOTLAGE  DS    CL12                    storage for total age of cars\n\
	NUMPRFIT DC    CL20' '                 Print total profit for all cars\n\
	        DC    C'TOTAL PROFIT:     '\n\
	TTLPRFIT DS    CL12                    storage for total profit of cars\n\
	        END PROGRAM2\n\
	//FT05F001 DD DSN=KC02298.CSCI360.DATALIB(DATA2),DISP=SHR\n\
	/*";

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