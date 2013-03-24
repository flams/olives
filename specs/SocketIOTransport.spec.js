/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["SocketIOTransport", "Observable"], function (SocketIOTransport, Observable) {

	var socket = null;

	beforeEach(function () {
		socket = {
			on: jasmine.createSpy("on"),
			once: jasmine.createSpy("once"),
			emit: jasmine.createSpy("emit"),
			removeListener: jasmine.createSpy("removeListener")
		};
	});

	describe("SocketIOTransportTest", function () {

		it("should be a constructor function", function () {
			expect(SocketIOTransport).toBeInstanceOf(Function);
		});

	});

	describe("SocketIOTransportTestInit", function () {

		var socketIOTransport = null;

		beforeEach(function () {
			socketIOTransport = new SocketIOTransport();
		});

		it("should set the socket (socket.io)", function () {
			expect(socketIOTransport.setSocket()).toBe(false);
			expect(socketIOTransport.setSocket({})).toBe(false);
			expect(socketIOTransport.setSocket(socket)).toBe(true);
		});

		it("should return the socket", function () {
			socketIOTransport.setSocket(socket);
			expect(socketIOTransport.getSocket()).toBe(socket);
		});

		it("should set the socket at init", function () {
			var transport = new SocketIOTransport(socket);
			expect(transport.getSocket()).toBe(socket);
		});

	});

	describe("SocketIOTransportTestRequests", function () {

		var socketIOTransport = null,
			reqData = {};

		beforeEach(function () {
			socketIOTransport = new SocketIOTransport(socket);
		});

		it("should subscribe to events", function () {
			var event = "event",
			func = function () {},
			returnValue = {};

			socket.on.andReturn(returnValue);

			expect(socketIOTransport.on(event, func)).toBe(returnValue);

			expect(socket.on.wasCalled).toBe(true);
			expect(socket.on.mostRecentCall.args[0]).toBe(event);
			expect(socket.on.mostRecentCall.args[1]).toBe(func);

		});

		it("should subscribe to events and disconnect after it fires", function () {
			var event = "event",
			func = function () {},
			returnValue = {};

			expect(socketIOTransport.once).toBeInstanceOf(Function);
			socket.once.andReturn(returnValue);

			expect(socketIOTransport.once(event, func)).toBe(returnValue);

			expect(socket.once.wasCalled).toBe(true);
			expect(socket.once.mostRecentCall.args[0]).toBe(event);
			expect(socket.once.mostRecentCall.args[1]).toBe(func);
		});

		it("should emit events", function () {
			var	event = "event",
			data = {},
			callback = function () {},
			returnValue = {};

			socket.emit.andReturn(returnValue);
			expect(socketIOTransport.emit(event, data, callback)).toBe(returnValue);

			expect(socket.emit.wasCalled).toBe(true);
			expect(socket.emit.mostRecentCall.args[0]).toBe(event);
			expect(socket.emit.mostRecentCall.args[1]).toBe(data);
			expect(socket.emit.mostRecentCall.args[2]).toBe(callback);
		});

		it("should remove listeners", function () {
			var	event = "event",
			data = {},
			callback = function () {},
			returnValue = {};

			socket.removeListener.andReturn(returnValue);
			expect(socketIOTransport.removeListener(event, data, callback)).toBe(returnValue);

			expect(socket.removeListener.wasCalled).toBe(true);
			expect(socket.removeListener.mostRecentCall.args[0]).toBe(event);
			expect(socket.removeListener.mostRecentCall.args[1]).toBe(data);
			expect(socket.removeListener.mostRecentCall.args[2]).toBe(callback);
		});

		it("should make requests", function () {
			var eventId;

			spyOn(socketIOTransport, "once").andCallThrough();

			expect(socketIOTransport.request).toBeInstanceOf(Function);

			expect(socketIOTransport.request()).toBe(false);
			expect(socketIOTransport.request("channel")).toBe(false);
			expect(socketIOTransport.request("channel", "data")).toBe(true);

			expect(socketIOTransport.once.wasCalled).toBe(true);

			eventId = socket.once.mostRecentCall.args[0];
			expect(eventId).toBeTruthy();

			expect(socket.once.mostRecentCall.args[1]).toBeInstanceOf(Function);

			expect(socket.emit.wasCalled).toBe(true);
			expect(socket.emit.mostRecentCall.args[0]).toBe("channel");
			expect(socket.emit.mostRecentCall.args[1].data).toBe("data");
			expect(socket.emit.mostRecentCall.args[1].eventId).toBe(eventId);
		});

		it("should make requests with callbacks", function () {
			var callback = jasmine.createSpy(),
				func,
				args = {};

			expect(socketIOTransport.request("channel", "data", callback)).toBe(true);

			func = socket.once.mostRecentCall.args[1];
			expect(func).toBeInstanceOf(Function);

			func(args);

			expect(callback.wasCalled).toBe(true);
			expect(callback.mostRecentCall.args[0]).toBe(args);
		});

		it("should make requests in scope", function () {
			var callback = jasmine.createSpy(),
				scope = {};

			expect(socketIOTransport.request("channel", "data", callback, scope)).toBe(true);

			socket.once.mostRecentCall.args[1]();

			expect(callback.mostRecentCall.object).toBe(scope)
		});

		it("should also listen to kept-alive socket", function () {
			var callback = jasmine.createSpy(),
				eventId,
				func;

			spyOn(socketIOTransport, "on").andCallThrough();

			expect(socketIOTransport.listen).toBeInstanceOf(Function);

			expect(socketIOTransport.listen()).toBe(false);
			expect(socketIOTransport.listen("channel")).toBe(false);
			expect(socketIOTransport.listen("channel", "data")).toBe(false);
			expect(socketIOTransport.listen("channel", "data", callback)).toBeTruthy();

			expect(socketIOTransport.on.wasCalled).toBe(true);

			eventId = socket.on.mostRecentCall.args[0];
			expect(eventId).toBeTruthy();

			func = socket.on.mostRecentCall.args[1];
			expect(func).toBeInstanceOf(Function);
			func();

			expect(socket.emit.wasCalled).toBe(true);
			expect(socket.emit.mostRecentCall.args[0]).toBe("channel");
			expect(socket.emit.mostRecentCall.args[1].data).toBe("data");
			expect(socket.emit.mostRecentCall.args[1].eventId).toBe(eventId);
		});

		it("should return a stop function that disconnects the channel", function () {
			var callback = jasmine.createSpy(),
				eventId,
				stopFunc;

			spyOn(socketIOTransport, "on");
			spyOn(socketIOTransport, "emit");
			spyOn(socketIOTransport, "removeListener");

			var stopFunc = socketIOTransport.listen("channel", "data", callback);
			eventId = socketIOTransport.on.mostRecentCall.args[0];

			expect(stopFunc.name).toBe("stop");

			stopFunc();

			expect(socketIOTransport.emit.wasCalled).toBe(true);
			expect(socketIOTransport.emit.mostRecentCall.args[0]).toBe("disconnect-" + eventId);

			expect(socketIOTransport.removeListener.wasCalled).toBe(true);
			expect(socketIOTransport.removeListener.mostRecentCall.args[0]).toBe(eventId);
			expect(socketIOTransport.removeListener.mostRecentCall.args[1]).toBe(socketIOTransport.on.mostRecentCall.args[1]);


		});

	});

});
