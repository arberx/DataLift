
// Data samples are stored here
var dataSet = [];

// // add smooth chart
// var smoothie = new SmoothieChart();


//for reactnative look here:
https://www.npmjs.com/package/react-native-eventsource

//add event listener, when intial html has been loaded
document.addEventListener( 'DOMContentLoaded', function () {
	if (!!window.EventSource) {

		// EventSource is used to listen to server sent events receives events in text/event-stream format
		var source = new EventSource('data');
		source.addEventListener('message', function(e) {
			// e.data is the SSE data, which is a two-character hexadecimal string representing a value
			console.log("msg=" + e.data);

            for(var ii = 0; ii < e.data.length; ii += 2) {
                handleData(parseInt('0x' + e.data.substr(ii, 2)));
            }
		}, false);
	}
	else {
		console.log('sse not supported');
	}
}, false );

function handleData(data) {
	// data is a number value (currently 0 - 255)

	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	// console.log(data);

	// Add to the data set, remove from the left if it gets wider than the canvas
	dataSet.push(data);
	if (dataSet.length > (canvas.width - 1)) {
		dataSet.shift();
	}

	// Erase
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw samples
	ctx.fillStyle = "#000000";

	for(var ii = 0; ii < dataSet.length; ii++) {
		var yy = 255 - dataSet[ii];

		ctx.fillRect(ii, yy, 1, 1);
	}

	// var canvas = document.getElementById("mycanvas");

	// console.log(data);

	// var line1 = new TimeSeries();

	// line1.append(new Date().getTime(), data);

	// smoothie.addTimeSeries(line1);
	// smoothie.streamTo(canvas);
}

