
// Data samples are stored here
var dataSet = [];
var fAve = 0.0;
var fSmp = 0;
var previous_point = 0;
var global_counter = 0;
var rep_counter = 0;

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
			// console.log("msg=" + e.data);

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
	var weight = 0
	fSmp += 1;
	weight = 1/fSmp;
	fAve = (weight * data) + ((1-weight) * fAve);

	if (previous_point != 0 && previous_point < data){
		global_counter += 1;
	}

	if (global_counter == 20){
		rep_counter += 1;
		global_counter = 0;
	}

	// set previous point equal to data
	previous_point = data;
	console.log("fAve: " + fAve)

	document.getElementById("averg_v").innerHTML = fAve;

	// display the global rep_counter
	document.getElementById("reps").innerHTML = rep_counter;

	console.log("global_counter: " + global_counter);

	var canvas = document.getElementById("mycanvas");
	var ctx = canvas.getContext("2d");


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

		ctx.fillRect(ii, yy, 3, 3);


	}

	// var canvas = document.getElementById("mycanvas");

	// console.log(data);

	// var line1 = new TimeSeries();

	// line1.append(new Date().getTime(), data);

	// smoothie.addTimeSeries(line1);
	// smoothie.streamTo(canvas);
}

