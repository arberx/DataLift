
/*
Variation of Livegraph JS
*/



// Data samples are stored here
var dataSet = [];
// values for calculating
var fAve = 0.0;
var fSmp = 0;
var previous_point = 0;
var global_counter = 0;
var rep_counter = 0;

var set_counter = 0;

window.onload = function () {
	var start = document.getElementById("startRecord");
	var stop = document.getElementById("pauseRecord");
	var record = document.getElementById("resetRep");
	stop.addEventListener("click", recordEvent);
	start.addEventListener("click", startLiveGraph);
	record.addEventListener("click", repReset);
}

// reset the rep counter
function repReset(){
	rep_counter = 0;
}



// display the paused value at the bottom of the screen
function recordEvent(){

	var arry_leng = dataSet.length;

	//last value in the array
	var i = dataSet[arry_leng-1];
	document.getElementById("display_value").innerHTML = "Max Score for Set: " + i;

}


//add event listener, when intial html has been loaded
function startLiveGraph()  {
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
}

function handleData(data) {
	// data is a number value (currently 0 - 255)
	var weight = 0
	fSmp += 1;
	weight = 1/fSmp;
	fAve = (weight * data) + ((1-weight) * fAve);

	if (previous_point != 0 && previous_point < (data - 3)){
		global_counter += 1;
	}

	if (global_counter == 8){
		rep_counter += 1;
		global_counter = 0;
	}

	// set previous point equal to data
	previous_point = data;
	// console.log("fAve: " + fAve)
	console.log("global_counter: " + global_counter);

	// display the "power score"
	document.getElementById("averg_v").innerHTML = fAve;

	// display the global rep_counter
	document.getElementById("reps").innerHTML = Math.ceil(rep_counter / 2);


	var canvas = document.getElementById('mycanvas');
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

		ctx.fillRect(ii, yy, 3, 3);

	}

}
