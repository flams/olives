/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

require(["Transport"], function (Transport) {
	
	describe("TransportTest", function () {
		
		it("should be a constructor function", function () {
			expect(Transport).toBeInstanceOf(Function);
		});
		
		it("should have the following API", function () {
			var transport = new Transport();
			expect(transport.request).toBeInstanceOf(Function);
			expect(transport.listen).toBeInstanceOf(Function);
			expect(transport.setReqHandlers).toBeInstanceOf(Function);
			expect(transport.getReqHandlers).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TransportInit", function () {
		
		var transport = null;
		
		beforeEach(function () {
			transport = new Transport;
		});
		
		it("should set the requests handlers", function () {
			var reqHandlers = {};
			transport = new Transport();
			
			expect(transport.getReqHandlers()).toBeNull();
			expect(transport.setReqHandlers()).toEqual(false);
			expect(transport.setReqHandlers(reqHandlers)).toEqual(true);
			expect(transport.getReqHandlers()).toBe(reqHandlers);
		});
		
		it("shoud set the requests handler at init", function () {
			var reqHandlers = {};
			transport = new Transport(reqHandlers);
			
			expect(transport.getReqHandlers()).toBe(reqHandlers);
		});
	});
	
	describe("TransportRequestTest", function () {
		
		var transport = null,
			reqHandlers = null,
			reqData = null;
		
		beforeEach(function () {
			reqHandlers =  {
					"channel": jasmine.createSpy()
			};
			reqData = {};
			transport = new Transport(reqHandlers);
		});
		
		it("should pass the request to the request handler", function () {
			expect(transport.request()).toEqual(false);
			expect(transport.request("channel")).toEqual(false);
			expect(transport.request("channel", reqData)).toEqual(true);
			expect(reqHandlers.channel.wasCalled).toEqual(true);
			expect(reqHandlers.channel.mostRecentCall.args[0]).toBe(reqData);
		});
		
		it("should pass the request with the callback", function () {
			var spy = jasmine.createSpy(),
				cb,
				args = {};
			expect(transport.request("channel", reqData, spy)).toEqual(true);
			cb = reqHandlers.channel.mostRecentCall.args[1];
			cb(args);
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toBe(args);
			
		});
		
		it("should execute the callback in scope", function () {
			var spy = jasmine.createSpy(),
				thisObj = {},
				cb;
			
			expect(transport.request("channel", reqData, spy, thisObj)).toEqual(true);
			cb = reqHandlers.channel.mostRecentCall.args[1];
			expect(typeof cb).toEqual("function");
			cb();
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});

	});

	describe("TransportListenTest", function () {
		
		var transport = null,
		reqHandlers = null,
		url = "/",
		func = jasmine.createSpy(),
		obj = jasmine.createSpy();
	
		beforeEach(function () {
			reqHandlers =  {
					"channel": function () {
						return {
							scope:obj,
							func: func
						};
					}
			};
			transport = new Transport(reqHandlers);
			spyOn(reqHandlers, "channel").andCallThrough();
		});
		
		it("should allow to listen on a given url", function () {
			var spy = jasmine.createSpy();
			expect(transport.listen()).toEqual(false);
			expect(transport.listen("channel")).toEqual(false);
			expect(transport.listen("channel", url)).toEqual(false);
			expect(transport.listen("fake", url, spy)).toEqual(false);
			expect(transport.listen("channel", url, spy)).toBeTruthy();
		});
		
		it("should pass the data to the reqHandler", function () {
			var spy = jasmine.createSpy(),
				cb,
				reqData,
				args = {};
			transport.listen("channel", url, spy);
			
			expect(reqHandlers.channel.wasCalled).toEqual(true);
			reqData = reqHandlers.channel.mostRecentCall.args[0];
			expect(reqData.keptAlive).toEqual(true);
			expect(reqData.method).toEqual("get");
			expect(reqData.path).toEqual(url);
			cb = reqHandlers.channel.mostRecentCall.args[1];
			expect(typeof cb).toEqual("function");
			cb(args);
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toBe(args);
			expect(reqHandlers.channel.mostRecentCall.args[2]).toBe(cb);
		});
		
		it("should execute the callback in scope", function () {
			var spy = jasmine.createSpy(),
				thisObj = {};
			
			transport.listen("channel", url, spy, thisObj);
			reqHandlers.channel.mostRecentCall.args[1]();
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should return a stop function", function () {
			var spy = jasmine.createSpy(),
				stop = transport.listen("channel", url, spy);
			
			expect(stop).toBeInstanceOf(Function);
			stop();
			expect(func.wasCalled).toEqual(true);
			expect(func.mostRecentCall.object).toBe(obj);
		});
		
	});
	
});