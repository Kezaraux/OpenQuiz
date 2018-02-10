(function() {
	var serverUrl = 'http://localhost:8000';
	var xmlhttp = new XMLHttpRequest();

	var profileInfo = (function() {
		xmlhttp.open('GET', serverUrl + '/getProfileInfo', false);
		xmlhttp.send();
		if (xmlhttp.status === 200) {
			return JSON.parse(xmlhttp.responseText);
		}
	})();

	var userInfo = (function() {
		xmlhttp.open('GET', serverUrl + '/getUser', false);
		xmlhttp.send();
		if (xmlhttp.status === 200) {
			return JSON.parse(xmlhttp.responseText);
		}
	})();

	var app = angular.module('Profile',[]);

	app.controller('ProfileInfo', function() {
		this.profileInfo = profileInfo;
		this.userInfo = userInfo;

		this.isAdmin = function() {
			return this.userInfo.type === 'admin';
	    };

		this.getName = function() {
			return this.profileInfo.given_name + ' ' + this.profileInfo.family_name;
		};

		this.getCompletedTests = function() {
			var completedMarks = [];
			this.userInfo.tests.forEach(function(test) {
				var highestMark;
				test.marks.forEach(function(mark) {
					if (mark >= 65) {
						highestMark = mark;
					}
				});
				if (highestMark) {
					completedMarks.push(highestMark);
				}
			});
			return completedMarks.length;
		};

		this.getAttemptedTests = function() {
			var testAttempts = 0;
			this.userInfo.tests.forEach(function(test) {
				testAttempts += test.marks.length;
			});
			return testAttempts;
		};

		this.getAllMarks = function() {
			var marks = [];
			this.userInfo.tests.forEach(function(test) {
				test.marks.forEach(function(mark) {
					marks.push(mark);
				});
			});
			return marks;
		};

		this.getAverageScore = function() {
			if (this.userInfo.tests.length > 0) {
				var marks = this.getAllMarks();
				var avgScore = 0;
				marks.forEach(function(mark) {
					avgScore += mark;
				});
				return Math.floor(avgScore / marks.length) + '%';
			} else {
				return 'N/A';
			}
		};

		this.getImage = function() {
			return this.profileInfo.picture;
		};

		var marks = [];
		var attempts = [];
		this.userInfo.tests.forEach(function(test) {
			var avg = 0;
			var atmpt = 0;
			test.marks.forEach(function(mark) {
				avg += mark;
				atmpt++;
			});
			avg = Math.floor(avg / test.marks.length);
			marks.push(avg);
			attempts.push(atmpt);
		});
		var data = {
			labels: userInfo.course_titles,
			datasets: [
				{
					label: 'Mark',
					fillColor: 'rgba(255,0,0,0.5)',
					strokeColor: 'rgba(255,0,0,0.8)',
					highlightFill: 'rgba(255,0,0,0.5)',
					highlightStroke: 'rgba(255,0,0,0.5)',
					pointStrokeColor: '#fff',
					pointHighlightFill: '#fff',
					pointHighlightStroke: 'rgba(220,220,220,1)',
					data: marks
				},
				{
					label: 'Attempts',
					fillColor: 'rgba(151,187,205,0.5)',
					strokeColor: 'rgba(151,187,205,0.8)',
					highlightFill: 'rgba(151,187,205,0.75)',
					highlightStroke: 'rgba(151,187,205,1)',
					data: attempts
				}
			]
		};
		var options = [
 			{

 				//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
 				scaleBeginAtZero : true,

 				//Boolean - Whether grid lines are shown across the chart
 				scaleShowGridLines : true,

 				//String - Colour of the grid lines
 				scaleGridLineColor : 'rgba(0,0,0,.05)',

 				//Number - Width of the grid lines
 				scaleGridLineWidth : 1,

 				//Boolean - Whether to show horizontal lines (except X axis)
 				scaleShowHorizontalLines: true,

 				//Boolean - Whether to show vertical lines (except Y axis)
 				scaleShowVerticalLines: true,

 				//Boolean - If there is a stroke on each bar
 				barShowStroke : true,

 				//Number - Pixel width of the bar stroke
 				barStrokeWidth : 2,

 				//Number - Spacing between each of the X value sets
 				barValueSpacing : 5,

 				//Number - Spacing between data sets within X values
 				barDatasetSpacing : 1,

 				//String - A legend template
 				legendTemplate : '<ul class=\'<%=name.toLowerCase()%>-legend\'><% for (var i=0; i<datasets.length; i++){%><li><span style=\'background-color:<%=datasets[i].lineColor%>\'></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
 		}];
	 	var ctx = document.getElementById('statchart').getContext('2d');
	 	var statChart = new Chart(ctx).Bar(data,options);
 	});
 })();
