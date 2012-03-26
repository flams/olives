/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

// HTTP is going to be used for the built-in CouchDB requests handler
var http = require("http"),

qs = require("querystring"),

requirejs = require("requirejs");

// Load Emily
requirejs(__dirname + "/build/Emily.js");

// We're going to need Stores to store the handlers.
// The Store's observers can be useful. They'll actually be used by Olives
requirejs(["Store"], function (Store) {
	
	// There's a store to save the configuration
	exports.config = new Store({
		// CouchDB is built-in
		// Copy this to CouchDB2, 3... if you have more than one of them
		"CouchDB": {
			hostname: "127.0.0.1",
			port: 5984
		}
	
	});

	// There's a store to save each handler
	exports.handlers = new Store({
		
		// CouchDB is built-in
		"CouchDB" : function (data, onEnd, onData) {
			
			data.hostname = exports.config.get("CouchDB").hostname;
			data.port = exports.config.get("CouchDB").port;
			data.path += "?" + qs.stringify(data.query);

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
			
			return function () {
				req.abort();
			};

		}
		
		/**
		 *  // This handler is here for the example.
		 *  "FileSystem": function (data, onEnd) {
		 *		onEnd(fs.readFileSync("./" + data.file, "utf8"));
		 *	}
		 * 
		 */
	
	});
	
});


