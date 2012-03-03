/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

require(["Promise", "Observable", "StateMachine"], function (Promise, Observable, StateMachine) {
	
	describe("PromiseInit", function () {
		
		it("should be a constructor function", function () {
			expect(Promise).toBeInstanceOf(Function);
		});
		
		it("should return an object once created with the following methods", function () {
			var promise = new Promise();
			expect(promise.then).toBeInstanceOf(Function);
			expect(promise.resolve).toBeInstanceOf(Function);
			expect(promise.reject).toBeInstanceOf(Function);
		});
		
		it("should return its observer and statemachine for debugging", function () {
			var promise = new Promise();
			expect(promise.getStateMachine).toBeInstanceOf(Function);
			expect(promise.getObservable).toBeInstanceOf(Function);
			expect(promise.getStateMachine()).toBeInstanceOf(StateMachine);
			expect(promise.getObservable()).toBeInstanceOf(Observable);
		});
		
	});
	
	describe("PromiseResolve", function () {
		
		var promise = null,
			stateMachine = null;
		
		beforeEach(function () {
			promise = new Promise();
			stateMachine = promise.getStateMachine();
		});
		
		it("should have its stateMachine init'd at Unresolved", function () {
			expect(stateMachine.getCurrent()).toEqual("Unresolved");
		});
		
		it("should resolve the promise", function () {
			spyOn(stateMachine, "event").andCallThrough();
			expect(promise.resolve()).toEqual(true);
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("resolve");
			expect(stateMachine.getCurrent()).toEqual("Resolved");
		});
		
		it("should resolve the promise only once", function () {
			expect(promise.resolve()).toEqual(true);
			expect(promise.resolve()).toEqual(false);
		});
		
		it("should reject the promise", function () {
			spyOn(stateMachine, "event").andCallThrough();
			expect(promise.reject()).toEqual(true);
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("reject");
			expect(stateMachine.getCurrent()).toEqual("Rejected");
		});
		
		it("should reject the promise only once", function () {
			expect(promise.reject()).toEqual(true);
			expect(promise.reject()).toEqual(false);
		});
		
	});
	
	describe("PromiseThens", function () {
	
		var promise = null,
			observable = null,
			stateMachine = null;
		
		beforeEach(function () {
			promise = new Promise();
			observable = promise.getObservable();
			stateMachine = promise.getStateMachine();
		});
		
		it("should add a then", function () {
			var then = jasmine.createSpy();
			spyOn(observable, "watch");
			spyOn(stateMachine, "event").andCallThrough();
			
			promise.then(then);
			expect(observable.watch.wasCalled).toEqual(true);
			expect(observable.watch.mostRecentCall.args[0]).toEqual("success");
			expect(observable.watch.mostRecentCall.args[1]).toBe(then);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("addSuccess");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(then);
		});
		
		it("should add a then with its scope", function () {
			var then = jasmine.createSpy(),
				thisObj = {};
			spyOn(observable, "watch");
			spyOn(stateMachine, "event").andCallThrough();
			
			promise.then(then, thisObj);
			expect(observable.watch.wasCalled).toEqual(true);
			expect(observable.watch.mostRecentCall.args[0]).toEqual("success");
			expect(observable.watch.mostRecentCall.args[1]).toBe(then);
			expect(observable.watch.mostRecentCall.args[2]).toBe(thisObj);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("addSuccess");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(then);
			expect(stateMachine.event.mostRecentCall.args[2]).toBe(thisObj);
		});
		
		it("should add a then and its errback", function () {
			var then = jasmine.createSpy(),
				err = jasmine.createSpy();
			
			spyOn(observable, "watch");
			spyOn(stateMachine, "event").andCallThrough();
			
			promise.then(then, err);
			expect(observable.watch.wasCalled).toEqual(true);
			expect(observable.watch.mostRecentCall.args[0]).toEqual("fail");
			expect(observable.watch.mostRecentCall.args[1]).toBe(err);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("addFail");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(err);
		});
		
		it("should add a then and its errback with its scope", function () {
			var then = jasmine.createSpy(),
				err = jasmine.createSpy(),
				errThisObj = {};
			
			spyOn(observable, "watch");
			spyOn(stateMachine, "event").andCallThrough();
			
			promise.then(then, err, errThisObj);
			expect(observable.watch.wasCalled).toEqual(true);
			expect(observable.watch.mostRecentCall.args[0]).toEqual("fail");
			expect(observable.watch.mostRecentCall.args[1]).toBe(err);
			expect(observable.watch.mostRecentCall.args[2]).toBe(errThisObj);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("addFail");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(err);
			expect(stateMachine.event.mostRecentCall.args[2]).toBe(errThisObj);
		});
		
		it("should add a then, its scope, and its errback with its scope", function () {
			var then = jasmine.createSpy(),
				thenThisObj = {},
				err = jasmine.createSpy(),
				errThisObj = {};
			
			spyOn(observable, "watch");
			spyOn(stateMachine, "event").andCallThrough();
			
			promise.then(then, thenThisObj, err, errThisObj);
			expect(observable.watch.wasCalled).toEqual(true);
			expect(observable.watch.mostRecentCall.args[0]).toEqual("fail");
			expect(observable.watch.mostRecentCall.args[1]).toBe(err);
			expect(observable.watch.mostRecentCall.args[2]).toBe(errThisObj);
			
			expect(stateMachine.event.wasCalled).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("addFail");
			expect(stateMachine.event.mostRecentCall.args[1]).toBe(err);
			expect(stateMachine.event.mostRecentCall.args[2]).toBe(errThisObj);
		});
		
		it("should provide a chainable then", function () {
			expect(promise.then()).toBe(promise);
		});
	});
	
	describe("PromiseExecCallbacks", function () {
		
		var promise = null,
			observable = null;
		
		beforeEach(function () {
			promise = new Promise();
			observable = promise.getObservable();
		});
		
		it("should notify the resolved value", function () {
			spyOn(observable, "notify");
			promise.resolve();
			expect(observable.notify.wasCalled).toEqual(true);
			expect(observable.notify.mostRecentCall.args[0]).toEqual("success");
			expect(observable.notify.mostRecentCall.args[1]).toBeUndefined();
		});
		
		it("should notify the rejected value", function () {
			spyOn(observable, "notify");
			promise.reject("Emily");
			expect(observable.notify.wasCalled).toEqual(true);
			expect(observable.notify.mostRecentCall.args[0]).toEqual("fail");
			expect(observable.notify.mostRecentCall.args[1]).toEqual("Emily");
		});
		
		it("should resolve only once and return the resolved value for the next thenables", function () {
			spyOn(observable, "notify");
			promise.resolve("Emily");
		});
		
	});
	
	describe("PromiseAddThenableAfterResolve", function () {
		
		var promise = null;
		
		beforeEach(function () {
			promise = new Promise();
		});
		
		it("should directly execute the callback when a then is added after resolution", function () {
			var spy = jasmine.createSpy();
			promise.resolve("Emily");
			promise.then(spy);
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual("Emily");
			
		});
		
		it("should directly execute the callback in scope when a then is added after resolution", function () {
			var spy = jasmine.createSpy(),
				thisObj = {};
			promise.resolve("Emily");
			promise.then(spy, thisObj);
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.object).toBe(thisObj);
			expect(spy.mostRecentCall.args[0]).toEqual("Emily");
		});
		
		it("should directly execute the callback when a then is added after rejection", function () {
			var spy = jasmine.createSpy();
			promise.reject("Emily");
			promise.then(function(){}, spy);
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual("Emily");
			
		});
		
		it("should directly execute the callback in scope when a then is added after rejection", function () {
			var spy = jasmine.createSpy(),
				thisObj = {};
			promise.reject("Emily");
			promise.then(function(){}, {}, spy, thisObj);
			
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.object).toBe(thisObj);
			expect(spy.mostRecentCall.args[0]).toEqual("Emily");
		});
	});
	
});