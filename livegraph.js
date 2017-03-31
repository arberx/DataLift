// Run this like:
// node livegraph.js

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var baseDirectory = path.join(__dirname, "public");
var net = require('net');

// httpPort is the port the web browser is listening on.
// http://localhost:8080/
var httpPort = 8080;

// dataPort is the TCP port we listen on from the Photon.
var dataPort = 8081;

// This array holds the clients (actually http server response objects) to send data to over SSE
var clients = [];

//  For the static files we server out of the
var contentTypeByExtension = {
		'.css':  'text/css',
		'.gif':  'image/gif',
		'.html': 'text/html',
		'.jpg':  'image/jpeg',
		'.js':   'text/javascript',
		'.png':  'image/png',
};

// Create an HTTP server
http.createServer(function (request, response) {
	try {
		var requestUrl = url.parse(request.url);

		// path.normalize prevents using .. to go above the base directory
		var pathname = path.normalize(requestUrl.pathname);

		if (pathname == '/data' || pathname == '\\data') {
			// Return SSE data
			// http://www.html5rocks.com/en/tutorials/eventsource/basics/
			var headers = {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
			};
			response.writeHead(200, headers);

			console.log("starting sse");
			clients.push(response);
		}
		else {
		    // Allows http://localhost:8080/ to be used as the URL to retrieve the main index page
			if (pathname == '/' || pathname == '\\') {
				pathname = 'index.html';
			}

			// Include an appropriate content type for known files like .html, .js, .css
			var headers = {};
		    var contentType = contentTypeByExtension[path.extname(pathname)];
		    if (contentType) {
		    	headers['Content-Type'] = contentType;
		    }

		    // this can only serve files in the public directory
			var fsPath = path.join(baseDirectory, pathname);

			var fileStream = fs.createReadStream(fsPath);
			response.writeHead(200, headers);
			fileStream.pipe(response);
			fileStream.on('error',function(e) {
				response.writeHead(404);
				response.end();
			});
		}
	} catch(e) {
		response.writeHead(500);
		response.end();
		console.log(e.stack);
	}
}).listen(httpPort)

// Start a TCP Server. This is what receives data from the Particle Photon
net.createServer(function (socket) {
	console.log('data connection started from ' + socket.remoteAddress);

	// The server sends a 8-bit byte value for each sample. data as 2 hex digits
	socket.setEncoding('hex');

	socket.on('data', function (data) {
		//Send it to all of the SSE clients.
		sendDataToClients(data);
	});
	socket.on('end', function () {
		console.log('data connection ended');
	});
}).listen(dataPort);


// Send data to all SSE web browser clients. data must be a string.
function sendDataToClients(data) {
	var failures = [];

	clients.forEach(function (client) {
		// console.log("sending data");
		if (!client.write('data: ' + data + '\n\n')) {
			failures.push(client);
		}
	});

	failures.forEach(function (client) {
		console.log("ending sse");
		removeClient(client);
		client.end();
	});
}

// Remove client (actually a HttpServer response object) from the list of active clients
function removeClient(client) {
	var index = clients.indexOf(client);
	if (index >= 0) {
		clients.splice(index, 1);
	}
}



console.log('listening on port ' + httpPort + ' for http');
