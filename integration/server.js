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
	).listen(8000)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , http = require('http');

http.globalAgent.maxSockets = Infinity;

io.sockets.on("connection", function (socket) {
	socket.on("CouchDB", function (data) {
		data.hostname = "127.0.0.1";
		data.port = 5984;
		data.auth = "couchdb:couchdb";

		http.request(data, function (res) {
			var body = "";
			res.on('data', function (chunk) {
				data.keptAlive && socket.emit(data.__eventId__, ""+chunk);
				body += chunk;
			});
			res.on('end', function () {
				socket.emit(data.__eventId__, body);
			});
		}).end();
	});
	
	socket.on("FileSystem", function (data) {
		socket.emit(data.__eventId__, fs.readFileSync("./" + data.file, "utf8"));
	});

});
