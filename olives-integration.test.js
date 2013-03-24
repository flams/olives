/**
 * @license Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */
var olives = require("./olives-server.js"),
	io = require('socket.io'),
	connect = require("connect"),
	http = require("http");

var socket = io.listen(
		http.createServer(
			connect()
			.use(connect.static(__dirname + "/"))
		).listen(8000)
	);

olives.registerSocketIO(socket);

olives.handlers.set("myHandler1", function (payload, onEnd) {
	if (payload.req == "doesItWork?") {
		onEnd("It does work!");
	}
});

olives.handlers.set("myHandler2", function (payload, onEnd, onData) {
	if (payload.req == "does it work?") {
		onData("it ...<br />");
		onData("does ...<br />");
		onEnd("work!");
	}
});


