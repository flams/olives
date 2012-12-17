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

		//is it necessary to return boolean when set?
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

	/* we could do a private structure by creating a property object with all utils and that
	 we freeze */

	describe("EventPluginAddEventListener", function(){

		var eventPlugin = null,
			node = null;
			
		beforeEach(function() {
			node = document.createElement("div");
			eventPlugin = new EventPlugin({}, true);
			spyOn(node, "addEventListener").andCallThrough();
		});

		it("should add an event listener", function(){
			expect(eventPlugin.addEventListener).toBeInstanceOf(Function);
		});

		it("should listen event from the given node", function(){

			var func = function(){};
			eventPlugin.addEventListener(node, "click", func, true);

			expect(node.addEventListener.wasCalled).toEqual(true);
			expect(node.addEventListener.mostRecentCall.args[0]).toEqual("click");
			expect(node.addEventListener.mostRecentCall.args[1]).toBe(func);
			expect(node.addEventListener.mostRecentCall.args[2]).toEqual(true);


		});

		it("should map events according the browser type", function(){
			eventPlugin.addEventListener(node, "mousedown", function(){}, "true");
			expect(node.addEventListener.mostRecentCall.args[0]).toEqual("touchstart");
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
			spyOn(eventPlugin, "addEventListener").andCallThrough();
		});

		it("should have a listen function", function(){
			expect(eventPlugin.listen).toBeInstanceOf(Function);
		});
		
		//shoud we just triger events to test the listen method?
		it("should add dom event listener", function() {
			
			eventPlugin.listen(dom,"click","listener","true");
			expect(eventPlugin.addEventListener.wasCalled).toEqual(true);
			expect(eventPlugin.addEventListener.mostRecentCall.args[0]).toBe(dom);
			expect(eventPlugin.addEventListener.mostRecentCall.args[1]).toEqual("click");
			expect(eventPlugin.addEventListener.mostRecentCall.args[3]).toEqual(true);

		});

		it("should call the parent callback with parameters", function(){

			spyOn(obj, "listener");

			eventPlugin.listen(dom,"click","listener","true");

			var test = eventPlugin.addEventListener.mostRecentCall.args[2];
			expect(test).toBeInstanceOf(Function);
			var param = {};
			test(param);
			expect(obj.listener.mostRecentCall.object).toBe(obj);
			
			//test listener paramter
			expect(obj.listener.mostRecentCall.args[0]).toBe(param);
			expect(obj.listener.mostRecentCall.args[1]).toBe(dom);
		});
	});

	describe("EventPluginDelegate", function(){
		var eventPlugin = null,
			dom = null,
			obj = null;

		beforeEach(function(){
			obj = {
				listener : jasmine.createSpy("listener")
			};
			dom = document.createElement("div");
			dom.className = "is awesome";
			eventPlugin = new EventPlugin(obj);
			spyOn(eventPlugin, "addEventListener").andCallThrough();
		});

		it("should have a delegate function", function(){
			expect(eventPlugin.delegate).toBeInstanceOf(Function);
		});

		it("should add dom event listener", function(){
			eventPlugin.delegate(dom, "div.is.awesome", "click", "listener", "true");
			expect(eventPlugin.addEventListener.wasCalled).toEqual(true);
			expect(eventPlugin.addEventListener.mostRecentCall.args[0]).toEqual(dom);
			expect(eventPlugin.addEventListener.mostRecentCall.args[1]).toEqual("click");
			expect(eventPlugin.addEventListener.mostRecentCall.args[3]).toEqual(true);
		});

		it("should call the parent callback only if query matches with event target", function(){
			var node = document.createElement("div");
			node.appendChild(dom);

			eventPlugin.delegate(dom, "button #test", "click", "listener", "true");
			expect(obj.listener).not.toHaveBeenCalled();

			eventPlugin.delegate(dom, "div.is.awesome", "click", "listener", "true");

			eventPlugin.addEventListener.mostRecentCall.args[2].call(null, {
				target : dom
			});
			expect(obj.listener).toHaveBeenCalled();
		});
	});
	
});