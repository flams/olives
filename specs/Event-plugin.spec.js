/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["Olives/Event-plugin"], function (EventPlugin) {
	
	describe("EventPluginInit", function () {
		
		it("should be a constructor function", function () {
			expect(EventPlugin).toBeInstanceOf(Function);
		});
		
		it("Should have the following API", function() {
			var eventPlugin = new EventPlugin();
			expect(eventPlugin.listen).toBeInstanceOf(Function);
		});
		
	});

	describe("ParentObjectHandler", function(){
		var plugin = null;
		beforeEach(function(){
			plugin = new EventPlugin();
		});

		it("should have getter/setter functions", function(){
			expect(plugin.setParent).toBeInstanceOf(Function);
			expect(plugin.parent).toBeInstanceOf(Function);
		});

		it("should haven't default parent", function(){
			expect(plugin.parent()).toBe(null);
		});

		it("should allow to set parent object", function(){
			var obj = {};
			expect(plugin.setParent(obj)).toEqual(true);
			expect(plugin.parent()).toBe(obj);
		});

		it("should only set object as parent", function(){
			expect(plugin.setParent("test")).toEqual(false);
			expect(plugin.setParent(true)).toEqual(false);
			expect(plugin.setParent()).toEqual(false);
			expect(plugin.setParent(null)).toEqual(false);
			expect(plugin.setParent({})).toEqual(true);
		});

		it("should set parent at init if defined", function(){
			var obj = {};
			var plugin = new EventPlugin(obj);
			expect(plugin.parent()).toBe(obj);
		});

	});

	describe("MapHandler", function(){
		var plugin = null;
		beforeEach(function(){
			plugin = new EventPlugin({}, true);
		});
		it("should have getter/setter functions", function(){
			expect(plugin.map).toBeInstanceOf(Function);
			expect(plugin.setMap).toBeInstanceOf(Function);
		});

		//should we have a isMobile function?
		it("should by default map mouse with touch events", function(){
			expect(plugin.map("mousedown")).toEqual("touchstart");
			expect(plugin.map("mousemove")).toEqual("touchmove");
			expect(plugin.map("mouseup")).toEqual("touchend");
		});

		it("should return none mobile events", function(){
			//none or false
			var plugin = new EventPlugin({});
			expect(plugin.map("mousedown")).toEqual("mousedown");
			expect(plugin.map("mousemove")).toEqual("mousemove");
			expect(plugin.map("mouseup")).toEqual("mouseup");
		});

		it("should not map unset events", function(){
			expect(plugin.map("click")).toEqual("click");
			expect(plugin.map("touchcancel")).toEqual("touchcancel");
		});

		it("should set map", function(){
			expect(plugin.setMap("click", "touchcancel")).toEqual(true);
			expect(plugin.map("click")).toEqual("touchcancel");
			expect(plugin.setMap("mousedown", "touchcancel")).toEqual(true);
			expect(plugin.map("mousedown")).toEqual("touchcancel");
			expect(plugin.setMap("mouseup")).toEqual(false);
			expect(plugin.map("mouseup")).toEqual("touchend");
			expect(plugin.setMap()).toEqual(false);
			expect(plugin.setMap(undefined, "touchstart")).toEqual(false);
			expect(plugin.setMap("mousedown", false)).toEqual(false);
			expect(plugin.map("mousedown")).toEqual("touchcancel");
		});
	});
	
	describe("EventPluginListen", function() {
		
		var eventPlugin = null,
			dom = null,
			obj = null;
			
		beforeEach(function() {
			var _func = function() {
				this.listener = function(event) {
				};
			};
			obj = new _func();
			dom = document.createElement("button");
			eventPlugin = new EventPlugin(obj);
		});
		
		it("Link addEventListener with the dom", function() {
			spyOn(dom,"addEventListener").andCallThrough();
			spyOn(obj, "listener");
			
			eventPlugin.listen(dom,"click","listener","true");
			expect(dom.addEventListener.wasCalled).toEqual(true);
			expect(dom.addEventListener.mostRecentCall.args[0]).toEqual("click");
			//expect(dom.addEventListener.mostRecentCall.args[1]).toBe(obj["listener"]);
			expect(dom.addEventListener.mostRecentCall.args[2]).toEqual(true);
			
			eventPlugin.listen(dom,"click","listener","test");
			expect(dom.addEventListener.mostRecentCall.args[2]).toEqual(false);
			
			eventPlugin.listen(dom,"click","listener","false");
			expect(dom.addEventListener.mostRecentCall.args[2]).toEqual(false);
			
			eventPlugin.listen(dom,"click","listener");
			expect(dom.addEventListener.mostRecentCall.args[2]).toEqual(false);
			
			var test = dom.addEventListener.mostRecentCall.args[1];
			expect(test).toBeInstanceOf(Function);
			var param = {};
			test(param);
			expect(obj.listener.mostRecentCall.object).toBe(obj);
			
			//test listener paramter
			expect(obj.listener.mostRecentCall.args[0]).toBe(param);
			expect(obj.listener.mostRecentCall.args[1]).toBe(dom);
		});
	});
	
});