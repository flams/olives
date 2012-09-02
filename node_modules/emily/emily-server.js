/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

// HTTP is going to be used for the built-in CouchDB requests handler
var http = require("http"),
	qs = require("querystring"),
	requirejs = require("requirejs"),
	cookie = require("cookie");

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

			var cfg = exports.config.get("CouchDB"),
				req;

			data.hostname = cfg.hostname;
			data.port = cfg.port;
			data.path += "?" + qs.stringify(data.query);

			var exec = function () {
				req = http.request(data, function (res) {

					var body = "";

					res.on("data", function (chunk) {
						onData && onData(chunk);
						body += chunk;
					});

					res.on("end", function () {
						onEnd(body);
					});
				});

				req.end(data.data, "utf8");
			};

			if (data.handshake) {

				var cookieJSON = cookie.parse(data.handshake.headers.cookie);

				// I don't like the split but is there a better solution?
				cfg.sessionStore.get(cookieJSON["suggestions.sid"].split("s:")[1].split(".")[0], function (err, session) {
					if (err) {
						throw new Error(err);
					} else {
						data.auth = session.auth;
						exec();
					}
				});
			} else {
				exec();
			}

			return function () {
				req.abort && req.abort();
			};
		}

	});

});

module.exports.requirejs = requirejs;
