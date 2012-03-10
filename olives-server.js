/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

var requirejs = require("requirejs"),
	emily = require("emily"),
	isConnected = false;

exports.handlers = emily.handlers;
exports.config = emily.config;

exports.registerSocketIO = function (io) {
	
	if (isConnected) {
		return false; 
	} else {
		
		// On connection we'll reference the handlers in socket.io
		io.sockets.on("connection", function (socket) {
			
			var connectHandler = function (func, handler) {
				// When a handler is called
				socket.on(handler, function (reqDdata) {
					// pass it the requests data
					func(reqDdata, 
						// The function to handle the result
						function onEnd(body) {
							socket.emit(reqDdata.__eventId__, body);
						}, 
						// The function to handle chunks for a kept alive socket
						function onData(chunk) {
							reqDdata.keptAlive && socket.emit(reqDdata.__eventId__, ""+chunk);
						});
				});
			};
			
			// for each handler, described in Emily as they can be used from node.js as well
			emily.handlers.loop(connectHandler);
			// Also connect on new handlers
			emily.handlers.watch("added", connectHandler);
			
		});
		
		isConnected = true;
	}

		
};


