/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */
 "use strict";

module.exports = {
	"Bind.plugin": require("data-binding-plugin"),
	"Event.plugin": require("event-plugin"),
	"LocalStore": require("local-observable-store"),
	"LocationRouter": require("url-highway"),
	"OObject": require("seam-view"),
	"Place.plugin": require("place-plugin"),
	"Plugins": require("seam"),
	"SocketIOTransport": require("socketio-transport"),
	"Stack": require("dom-stack")
};
