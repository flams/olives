/**
 * @license Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
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
				socket.on(handler, function (reqData) {
					
					// Add socket.io's handshake for session management
					reqData.handshake = socket.handshake;
					
					// pass it the requests data
					var stop = func(reqData, 
						// The function to handle the result
						function onEnd(body) {
							socket.emit(reqData.__eventId__, body);
						}, 
						// The function to handle chunks for a kept alive socket
						function onData(chunk) {
							reqData.__keepalive__ && socket.emit(reqData.__eventId__, ""+chunk);
						});
					
					// If func returned a stop function
					if (typeof stop == "function") {
						// Subscribe to disconnect-eventId event
						socket.on("disconnect-"+reqData.__eventId__, stop);
					}

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


