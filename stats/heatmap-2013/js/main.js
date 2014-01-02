

var common = {
	domain: "week",
	label: { 
		position:'left'
	},
	cellSize:30,
	subDomain: "x_day",
	subDomainTextFormat: "%d",
	considerMissingDataAsZero: true,
	verticalOrientation: true,
	weekStartOnMonday: false,
	data: "/data.json",
	
	itemName: ["job submission", "job submissions"],
	legend: [25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
	legendColors: { min:'#f0f9ff', max: '#00a1ff',empty: '#ffffff'}
};


common.itemSelector = "#SP2013";
common.start = new Date(2013, 2, 25);
common.range = 7;

new CalHeatMap()
	.init(common);
	
	
// Summer Semester June 17th - Aug 11th
common.itemSelector = "#SU2013";
common.start = new Date(2013, 5, 17);
common.range = 8;

new CalHeatMap()
	.init(common);


common.itemSelector = "#FA2013";
common.start = new Date(2013, 7, 26);
common.range = 16;

new CalHeatMap()
	.init(common);
