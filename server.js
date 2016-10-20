
//=================== HTTP PORTION ==========================
//===========================================================

var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(4000);

console.log("Listening on 4000");

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
	
	// Read index.html
	
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}

//=================== WEBSOCKETS PORTION ==========================
//=================================================================
var io = require('socket.io').listen(httpServer);

var theHigh = 0;

io.sockets.on('connection', // This is run for each individual user that connects
	function (socket) {
		console.log("We have a new client: " + socket.id);

		//emit this new high value to everyone
		io.sockets.emit('highAll', theHigh);

		//receive all mobile acceleration data
		socket.on('accelValue', function(data) {

			//if the value received is the the highest value yet, save it
			if (data > theHigh) {
				theHigh = data;
				console.log("theHigh = " + theHigh);

				// //emit this new high value to everyone
				io.sockets.emit('highAll', data);
			}
		});

		socket.on('phoneHigh', function(data){
			console.log("phone high = " + data);
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});

		socket.on('reset', function(data){
			console.log("RESET HAPPENED! " + data);
			theHigh = data;

			//send event to mobile version 
			io.sockets.emit('reset', data);
		});
	}
);


