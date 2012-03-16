/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */
require(["Olives/Transport", "Observable"], function (Transport, Observable) {

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

	describe("TransportTestAPI", function () {

		var transport = null;

		beforeEach(function () {
			transport = new Transport();
		});

		it("should have the correct API", function () {
			expect(transport.connect).toBeInstanceOf(Function);
			expect(transport.on).toBeInstanceOf(Function);
			expect(transport.emit).toBeInstanceOf(Function);
			expect(transport.getSocket).toBeInstanceOf(Function);
			expect(transport.setIO).toBeInstanceOf(Function);
			expect(transport.getIO).toBeInstanceOf(Function);
			expect(transport.request).toBeInstanceOf(Function);
			expect(transport.listen).toBeInstanceOf(Function);
		});
	});

	describe("TransportTestInit", function () {

		var transport = null;

		beforeEach(function () {
			transport = new Transport();
		});
		
		it("should set the io handler (socket.io)", function () {
			expect(transport.getIO()).toBeNull();
			expect(transport.setIO()).toEqual(false);
			expect(transport.setIO({})).toEqual(false);
			expect(transport.setIO(io)).toEqual(true);
			expect(transport.getIO()).toBe(io);
		});


		it("should connect transport on given url", function () {
			transport.setIO(io);
			expect(transport.connect()).toEqual(false);
			expect(transport.connect({})).toEqual(false);
			expect(transport.connect("/")).toEqual(true);
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
		socket = null;

		beforeEach(function () {
			transport = new Transport(io, "/");
			socket = transport.getSocket();
		});

		it("should subscribe to events", function () {
			var event = "event",
			func = function () {};

			transport.on(event, func);

			expect(socket.on.wasCalled).toEqual(true);
			expect(socket.on.mostRecentCall.args[0]).toEqual(event);
			expect(socket.on.mostRecentCall.args[1]).toEqual(func);

		});

		it("should subscribe to events and disconnect after it fires", function () {
			var event = "event",
			func = function () {};

			expect(transport.once).toBeInstanceOf(Function);

			transport.once(event, func);

			expect(socket.once.wasCalled).toEqual(true);
			expect(socket.once.mostRecentCall.args[0]).toEqual(event);
			expect(socket.once.mostRecentCall.args[1]).toEqual(func);
		});

		it("should emit events", function () {
			var	event = "event",
			data = {},
			callback = function () {};

			transport.emit(event, data, callback);

			expect(socket.emit.wasCalled).toEqual(true);
			expect(socket.emit.mostRecentCall.args[0]).toEqual(event);
			expect(socket.emit.mostRecentCall.args[1]).toEqual(data);
			expect(socket.emit.mostRecentCall.args[2]).toBe(callback);
		});

		it("should make requests", function () {
			var channel = "File",
			requestData = {
					resource: "image.jpg"
			},
			callback = jasmine.createSpy(),
			eventId;


			socket.once = function (id, func) {
				func();
			};
			spyOn(socket, "once").andCallThrough();

			expect(transport.request).toBeInstanceOf(Function);

			transport.request(channel, requestData, callback);

			expect(socket.once.wasCalled).toEqual(true);

			eventId = socket.once.mostRecentCall.args[0];
			expect(eventId).toBeTruthy();

			expect(socket.once.mostRecentCall.args[1]).toBeInstanceOf(Function);
			expect(callback.wasCalled).toEqual(true);
			expect(socket.emit.wasCalled).toEqual(true);
			expect(socket.emit.mostRecentCall.args[0]).toEqual(channel);
			expect(socket.emit.mostRecentCall.args[1]).toBeInstanceOf(Object);
			expect(socket.emit.mostRecentCall.args[1].__eventId__).toEqual(eventId);
		});

		it("should not fail if a request is made without callback function", function () {
			var channel = "File",
			requestData = {
					resource: "image.jpg"
			};

			socket.once = function (id, func) {
				func();
			};
			expect(function () {
				transport.request(channel, requestData);
			}).not.toThrow();
		});

		it("should make requests in scope", function () {
			var channel = "File",
			requestData = {
					resource: "image.jpg"
			},
			callback = jasmine.createSpy(),
			thisObj = {};

			socket.once = function (id, func) {
				func();
			};
			spyOn(socket, "once").andCallThrough();
			transport.request(channel, requestData, callback, thisObj);
			expect(callback.wasCalled).toEqual(true);
		});

		it("should also listen on a kept-alive socket", function () {
			var channel = "File",
			path = "image.jpg",
			callback = jasmine.createSpy(),
			listen,
			eventId;

			socket.on = function (id, func) {
				func();
			};
			spyOn(socket, "on").andCallThrough();

			expect(transport.listen).toBeInstanceOf(Function);

			spyOn(transport, "request").andCallThrough();
			stop = transport.listen(channel, path, callback);

			expect(stop).toBeInstanceOf(Function);

			expect(socket.on.wasCalled).toEqual(true);

			eventId = socket.on.mostRecentCall.args[0];
			expect(eventId).toBeTruthy();
			
			stop();

			expect(socket.emit.mostRecentCall.args[0]).toEqual("disconnect-" + eventId);
			expect(socket.removeListener.mostRecentCall.args[0]).toEqual(eventId);
			expect(socket.removeListener.mostRecentCall.args[1]).toBeInstanceOf(Function);
			expect(transport.request.wasCalled).toEqual(true);
			expect(transport.request.mostRecentCall.args[1].keptAlive).toEqual(true);

		});

		it("should implement an observable for the listen func", function () {
			var channel = "DB",
			path = "changes",
			observable, listen;

			expect(transport.getListenObservable).toBeInstanceOf(Function);
			observable = transport.getListenObservable();
			expect(observable).toBeInstanceOf(Observable);

			spyOn(observable, "watch").andCallThrough();
			spyOn(observable, "unwatch").andCallThrough();
			stop = transport.listen(channel, path, function () {});
			expect(observable.watch.wasCalled).toEqual(true);
			expect(observable.watch.mostRecentCall.args[0]).toEqual(channel + "/" + path);

			stop();

			expect(observable.unwatch.wasCalled).toEqual(true);
			expect(observable.unwatch.mostRecentCall.args[0]).toBeInstanceOf(Array);

		});

		it("should listen to the same path only once", function () {
			var channel = "DB",
			path = "changes",
			callback = jasmine.createSpy();

			spyOn(transport, "request");

			transport.listen(channel, path, callback);
			transport.listen(channel, path, callback);
			expect(transport.request.callCount).toEqual(1);
			transport.listen(channel, "otherpath", callback);
			expect(transport.request.callCount).toEqual(2);
		});

	});

});