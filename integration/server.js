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


io.sockets.on("connection", function (socket) {
	// Couchdb example
	//transport.request("CouchDB", {"path": "/_all_dbs", "method": "get", "reqId": "test"}, 
	//function (result) {console.log(JSON.parse(result))})
	
	socket.on("CouchDB", function (data) {
		data.hostname = "127.0.0.1";
		data.port = 5984;
		data.auth = "couchdb:couchdb";

		var req = http.request(data, function (res) {
			var body = "";
			res.on('data', function (chunk) {
				socket.emit(data.__eventId__, ""+chunk);
				body += chunk;
			});
			res.on('end', function () {
				socket.emit(data.__eventId__, body);
			});
		});
		req.end();
	});
	
	socket.on("CouchDBReq", function (data, fn) {
		data.hostname = "127.0.0.1";
		data.port = 5984;
		data.auth = "couchdb:couchdb";

		var req = http.request(data, function (res) {
			var body = "";
			res.on('data', function (chunk) {
				fn("" + chunk);
				body += chunk;
			});
			res.on('end', function () {
				fn("" + body);
			});
		});
		req.end();
	});
	
	
	socket.on("FileSystem", function (data) {
		socket.emit(data.__eventId__, fs.readFileSync("./" + data.file, "utf8"));
	});
	
	socket.on("Http", function (data) {
		http.request(data, function (res) {
			var body = "";
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on('end', function () {
				socket.emit(data.__eventId__, body);
			});
		}).end();
	});
});
