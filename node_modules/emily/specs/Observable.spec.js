/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

require(["Observable"], function (Observable) {
	
	describe("ObservableTest", function () {
		
		it("should be a function", function () {
			expect(Observable).toBeInstanceOf(Function);
		});
		
		it("should have the correct API once created", function () {
			var observable = new Observable();
			expect(observable.watch).toBeInstanceOf(Function);
			expect(observable.unwatch).toBeInstanceOf(Function);
			expect(observable.notify).toBeInstanceOf(Function);
			expect(observable.hasObserver).toBeInstanceOf(Function);
			expect(observable.hasTopic).toBeInstanceOf(Function);
		});
		
	});
	
	describe("ObservableWatch", function () {
		
		var observable = null,
			testTopic = "testTopic";
		
		beforeEach(function() {
			observable = new Observable();
		});
		
		it("should add an observer", function () {
			var spy = jasmine.createSpy("callback");
				handler = null;
			
			expect(observable.hasObserver(handler)).toEqual(false);
			handler = observable.watch(testTopic, spy);
			
			expect(observable.hasObserver(handler)).toEqual(true);
			
		});
		
		it("should add an observer on a topic that is a number", function () {
			var spy = jasmine.createSpy("callback");
			handler = null;
		
			expect(observable.hasObserver(handler)).toEqual(false);
			handler = observable.watch(0, spy);
			
			expect(observable.hasObserver(handler)).toEqual(true);
			
		});
		
		it("should add an observer with scope", function () {
			var spy = jasmine.createSpy("callback");
				handler = null;
			
			expect(observable.hasObserver(handler)).toEqual(false);
			handler = observable.watch(testTopic, spy, this);
			
			expect(observable.hasObserver(handler)).toEqual(true);
		});
		
		it("should add multiple observers with or without scopes", function () {
			var spy1 = jasmine.createSpy("callback");
				spy2 = jasmine.createSpy("callback");
				handler1 = null,
				handler2 = null,
				thisObj = {},
				testTopic = "testTopic";
			
			handler1 = observable.watch(testTopic, spy1);
			handler2 = observable.watch(testTopic, spy2, thisObj);
			expect(observable.hasObserver(handler1)).toEqual(true);
			expect(observable.hasObserver(handler2)).toEqual(true);
			
		});
		
		it("can remove an observer", function () {
			var spy = jasmine.createSpy("callback");
			handler;

			handler = observable.watch(testTopic, spy);
			expect(observable.unwatch(handler)).toEqual(true);

			expect(observable.hasObserver(handler)).toEqual(false);
			expect(observable.unwatch(handler)).toEqual(false);
		});
		
		it("should remove multiple observers", function () {
			var spy1 = jasmine.createSpy("callback");
				spy2 = jasmine.createSpy("callback");
				handler1 = null,
				handler2 = null,
				thisObj = {},
				testTopic = "testTopic";
		
			handler1 = observable.watch(testTopic, spy1);
			handler2 = observable.watch(testTopic, spy2, thisObj);
			expect(observable.unwatch(handler1)).toEqual(true);
			expect(observable.unwatch(handler2)).toEqual(true);
			expect(observable.unwatch(handler1)).toEqual(false);
			expect(observable.unwatch(handler2)).toEqual(false);
		});
		
		it("shouldn't add observer if wrong parameter count or type", function () {
			expect(observable.watch()).toEqual(false);
			expect(observable.watch("topic")).toEqual(false);
			expect(observable.watch(function(){}, "topic")).toEqual(false);
			expect(observable.watch("", {})).toEqual(false);
		});
		
		it("should remove all observers", function () {
			var handler1 = null,
				handler2 = null;
			
			handler1 = observable.watch("test", function(){});
			handler2 = observable.watch("test2", function(){});
			
			expect(observable.unwatchAll).toBeInstanceOf(Function);
			expect(observable.unwatchAll()).toEqual(true);
			
			expect(observable.hasObserver(handler1)).toEqual(false);
			expect(observable.hasObserver(handler2)).toEqual(false);
		});
		
		it("should remove all observers from one topic", function () {
			var handler1 = null,
				handler2 = null;
		
			handler1 = observable.watch("test", function(){});
			handler2 = observable.watch("test2", function(){});
			handler3 = observable.watch("test2", function(){});
			
			expect(observable.unwatchAll("test2")).toEqual(true);
			
			expect(observable.hasObserver(handler1)).toEqual(true);
			expect(observable.hasObserver(handler2)).toEqual(false);
			expect(observable.hasObserver(handler3)).toEqual(false);
		});
		
		it("should tell if a topic is already watched", function () {
			var topic = "topic",
				handler;
			
			handler = observable.watch("topic", function () {});
			expect(observable.hasTopic("topic")).toEqual(true);
			expect(observable.hasTopic("notopic")).toEqual(false);
			observable.unwatch(handler);
			expect(observable.hasTopic("topic")).toEqual(false);
		});
		
	});
	
	describe("ObservableNotify", function () {
		
		var observable = null,
			testTopic = "testTopic";
		
		beforeEach(function () {
			observable = new Observable();
		});
		
		it("should notify observer", function () {
			var spy = jasmine.createSpy("callback");
			
			observable.watch(testTopic, spy);
			expect(observable.notify(testTopic)).toEqual(true);
			expect(spy.wasCalled).toEqual(true);
		});
		
		it("should notify observer on topics that are numbers", function () {
			var spy = jasmine.createSpy("callback");
			
			observable.watch(0, spy);
			expect(observable.notify(0)).toEqual(true);
			expect(spy.wasCalled).toEqual(true);
			
		});
		
		it("should notify observer in scope", function () {
			var spy = jasmine.createSpy("callback");
				thisObj = {};
			
			observable.watch(testTopic, spy, thisObj);
			expect(observable.notify(testTopic)).toEqual(true);
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should pass parameters", function () {
			var spy = jasmine.createSpy("callback");
				post = {x:10};
		
			observable.watch(testTopic, spy);
			observable.notify(testTopic, post);
			
			expect(spy.mostRecentCall.args[0]).toBe(post);
		});
		
		it("should pass multiple parameters", function () {
			var spy = jasmine.createSpy("callback"),
				param1 = "param1",
				param2 = "param2";
			
			observable.watch(testTopic, spy);
			observable.notify(testTopic, param1, param2);
			
			expect(spy.mostRecentCall.args[0]).toEqual(param1);
			expect(spy.mostRecentCall.args[1]).toEqual(param2);
		});
		
		it("should notify all observers", function () {
			var spy1 = jasmine.createSpy("callback"),
				spy2 = jasmine.createSpy("callback"),
				thisObj = {},
				testTopic = "testTopic";
	
			observable.watch(testTopic, spy1);
			observable.watch(testTopic, spy2, thisObj);
			observable.notify(testTopic, "test");
			expect(spy1.wasCalled).toEqual(true);
			expect(spy2.wasCalled).toEqual(true);
			expect(spy2.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should return false when notifying on empty topics", function () {
			expect(observable.notify("fake")).toEqual(false);
		});
		
	});
	
	describe("ObservablesIsolated", function () {
		
		var observable1 = new Observable(),
			observable2 = new Observable(),
			testTopic = "testTopic";
		
		it("should add observer to only one observable", function () {
			var handler = observable1.watch(testTopic, function () {});
			expect(observable2.hasObserver(handler)).toEqual(false);
		});
		
		it("should notify only one observable", function () {
			expect(observable2.notify(testTopic)).toEqual(false);
		});
		
	});
	
});