/**
* This server is only for testing purpose.
* Don't use it in production
*/
var app = require('http').createServer(function (req, res) {
	var file = req.url != "/" ? req.url : '/index.html',
			filetype = file.split(".").pop(),
			types = {"html" : "html",
					 "js" : "javascript"};

  fs.readFile(__dirname + file,
		  function (err, data) {
		    if (err) {
		      res.writeHead(500);
		      return res.end('Error loading index.html');
		    }

		    res.writeHead(200, { 'Content-Type': 'text/' + types[filetype] });
		    res.end(data);
		  });
		}
).listen(8000),
io = require('socket.io').listen(app),
fs = require('fs'),
http = require('http');

http.globalAgent.maxSockets = Infinity;

// require olives. should be require("olives") once the npm is published
var olives = require("../olives-server.js");
// Register the instance of socket.io
// This API will change until the final release
olives.registerSocketIO(io);