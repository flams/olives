var requirejs = require("requirejs"),
	emily = require("emily");

exports.handlers = emily.handlers;
exports.config = emily.config;
exports.registerSocketIO = function (io) {
	
	requirejs(["Tools"], function (Tools) {
		// On connection we'll reference the handlers in socket.io
		io.sockets.on("connection", function (socket) {
			// for each handler, described in Emily as they can be used from node.js as well
			Tools.loop(emily.handlers, function (func, handler) {
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
			});
		});
		
	});
}


