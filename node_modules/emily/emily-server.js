var http = require("http"),
	requirejs = require("requirejs");

var config = {
	"CouchDB": {
		hostname: "127.0.0.1",
		port: 5984
	}
};

exports.config = config;

requirejs(__dirname + "/build/Emily.js");

exports.handlers = {
 "CouchDB" : function (data, onEnd, onData) {
	 data.hostname = config.CouchDB.hostname;
	 data.port = config.CouchDB.port;
		 
		var req = http.request(data, function (res) {
				
			var body = "";
			
			res.on('data', function (chunk) {
				onData && onData(chunk);
				body += chunk;
			});
			res.on('end', function () {
				onEnd(body);
			});
			
			
		});
		
		req.end(data.data, "utf8");
		
		return {scope: req, func: req.abort};
 	},
 	
 	"FileSystem": function (data, onEnd) {
 		onEnd(fs.readFileSync("./" + data.file, "utf8"));
 	}
};
