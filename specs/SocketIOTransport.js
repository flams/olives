/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["SocketIOTransport", "Observable"], function (Transport, Observable) {

	var io = null;

	beforeEach(function () {
		io = { connect : function connect(url) {
				return {
					on: jasmine.createSpy("on"),
					once: jasmine.createSpy("once"),
					emit: jasmine.createSpy("emit"),
					removeListener: jasmine.createSpy("removeListener")
				};
			}
		};
	});

	describe("TransportTest", function () {

		it("should be a constructor function", function () {
			expect(Transport).toBeInstanceOf(Function);
		});

	});

	describe("TransportTestInit", function () {

		var transport = null;

		beforeEach(function () {
			transport = new Transport();
		});

		it("should set the io handler (socket.io)", function () {
			expect(transport.getIO()).toBeNull();
			expect(transport.setIO()).toBe(false);
			expect(transport.setIO({})).toBe(false);
			expect(transport.setIO(io)).toBe(true);
			expect(transport.getIO()).toBe(io);
		});


		it("should connect transport on given url", function () {
			transport.setIO(io);
			expect(transport.connect()).toBe(false);
			expect(transport.connect({})).toBe(false);
			expect(transport.connect("/")).toBe(true);
		});

		it("should return the newly created socket", function () {
			transport.setIO(io);
			transport.connect("/");
			expect(transport.getSocket()).toBeInstanceOf(Object);
			expect(transport.getSocket().on).toBeInstanceOf(Function);
			expect(transport.getSocket().emit).toBeInstanceOf(Function);
		});

		it("should define io directly from init", function () {
			transport = new Transport(io);
			expect(transport.getIO()).toBe(io);
		});

		it("should be connected directly from create", function () {
			var url = "/",
				transport = new Transport(io, url);

			expect(transport.getSocket()).toBeTruthy();
		});

	});

	describe("TransportTestRequests", function () {

		var transport = null,
			socket = null,
			reqData = {};

		beforeEach(function () {
			transport = new Transport(io, "/");
			socket = transport.getSocket();
		});

		it("should subscribe to events", function () {
			var event = "event",
			func = function () {},
			returnValue = {};

			socket.on.andReturn(returnValue);

			expect(transport.on(event, func)).toBe(returnValue);

			expect(socket.on.wasCalled).toBe(true);
			expect(socket.on.mostRecentCall.args[0]).toBe(event);
			expect(socket.on.mostRecentCall.args[1]).toBe(func);

		});

		it("should subscribe to events and disconnect after it fires", function () {
			var event = "event",
			func = function () {},
			returnValue = {};

			expect(transport.once).toBeInstanceOf(Function);
			socket.once.andReturn(returnValue);

			expect(transport.once(event, func)).toBe(returnValue);

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
			expect(transport.emit(event, data, callback)).toBe(returnValue);

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
			expect(transport.removeListener(event, data, callback)).toBe(returnValue);

			expect(socket.removeListener.wasCalled).toBe(true);
			expect(socket.removeListener.mostRecentCall.args[0]).toBe(event);
			expect(socket.removeListener.mostRecentCall.args[1]).toBe(data);
			expect(socket.removeListener.mostRecentCall.args[2]).toBe(callback);
		});

		it("should make requests", function () {
			var eventId;

			spyOn(transport, "once").andCallThrough();

			expect(transport.request).toBeInstanceOf(Function);

			expect(transport.request()).toBe(false);
			expect(transport.request("channel")).toBe(false);
			expect(transport.request("channel", "data")).toBe(true);

			expect(transport.once.wasCalled).toBe(true);

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

			expect(transport.request("channel", "data", callback)).toBe(true);

			func = socket.once.mostRecentCall.args[1];
			expect(func).toBeInstanceOf(Function);

			func(args);

			expect(callback.wasCalled).toBe(true);
			expect(callback.mostRecentCall.args[0]).toBe(args);
		});

		it("should make requests in scope", function () {
			var callback = jasmine.createSpy(),
				scope = {};

			expect(transport.request("channel", "data", callback, scope)).toBe(true);

			socket.once.mostRecentCall.args[1]();

			expect(callback.mostRecentCall.object).toBe(scope)
		});

		it("should also listen to kept-alive socket", function () {
			var callback = jasmine.createSpy(),
				eventId,
				func;

			spyOn(transport, "on").andCallThrough();

			expect(transport.listen).toBeInstanceOf(Function);

			expect(transport.listen()).toBe(false);
			expect(transport.listen("channel")).toBe(false);
			expect(transport.listen("channel", "data")).toBe(false);
			expect(transport.listen("channel", "data", callback)).toBeTruthy();

			expect(transport.on.wasCalled).toBe(true);

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

			spyOn(transport, "on");
			spyOn(transport, "emit");
			spyOn(transport, "removeListener");

			var stopFunc = transport.listen("channel", "data", callback);
			eventId = transport.on.mostRecentCall.args[0];

			expect(stopFunc.name).toBe("stop");

			stopFunc();

			expect(transport.emit.wasCalled).toBe(true);
			expect(transport.emit.mostRecentCall.args[0]).toBe("disconnect-" + eventId);

			expect(transport.removeListener.wasCalled).toBe(true);
			expect(transport.removeListener.mostRecentCall.args[0]).toBe(eventId);
			expect(transport.removeListener.mostRecentCall.args[1]).toBe(transport.on.mostRecentCall.args[1]);


		});

	});

});
