/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["Event.plugin"], function (EventPlugin) {

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
			expect(plugin.getParent).toBeInstanceOf(Function);
		});

		it("should haven't default parent", function(){
			expect(plugin.getParent()).toBe(null);
		});

		it("should allow to set parent object", function(){
			var obj = {};
			expect(plugin.setParent(obj)).toBe(true);
			expect(plugin.getParent()).toBe(obj);
		});

		it("should only set object as parent", function(){
			expect(plugin.setParent("test")).toBe(false);
			expect(plugin.setParent(true)).toBe(false);
			expect(plugin.setParent()).toBe(false);
			expect(plugin.setParent(null)).toBe(false);
			expect(plugin.setParent({})).toBe(true);
		});

		it("should set parent at init if defined", function(){
			var obj = {};
			var plugin = new EventPlugin(obj);
			expect(plugin.getParent()).toBe(obj);
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
			expect(plugin.map("mousedown")).toBe("touchstart");
			expect(plugin.map("mousemove")).toBe("touchmove");
			expect(plugin.map("mouseup")).toBe("touchend");
		});

		it("should return none mobile events", function(){
			//none or false
			var plugin = new EventPlugin({});
			expect(plugin.map("mousedown")).toBe("mousedown");
			expect(plugin.map("mousemove")).toBe("mousemove");
			expect(plugin.map("mouseup")).toBe("mouseup");
		});

		it("should not map unset events", function(){
			expect(plugin.map("click")).toBe("click");
			expect(plugin.map("touchcancel")).toBe("touchcancel");
		});

		//is it necessary to return boolean when set?
		it("should set map", function(){
			expect(plugin.setMap("click", "touchcancel")).toBe(true);
			expect(plugin.map("click")).toBe("touchcancel");
			expect(plugin.setMap("mousedown", "touchcancel")).toBe(true);
			expect(plugin.map("mousedown")).toBe("touchcancel");
			expect(plugin.setMap("mouseup")).toBe(false);
			expect(plugin.map("mouseup")).toBe("touchend");
			expect(plugin.setMap()).toBe(false);
			expect(plugin.setMap(undefined, "touchstart")).toBe(false);
			expect(plugin.setMap("mousedown", false)).toBe(false);
			expect(plugin.map("mousedown")).toBe("touchcancel");
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

			expect(node.addEventListener.wasCalled).toBe(true);
			expect(node.addEventListener.mostRecentCall.args[0]).toBe("click");
			expect(node.addEventListener.mostRecentCall.args[1]).toBe(func);
			expect(node.addEventListener.mostRecentCall.args[2]).toBe(true);


		});

		it("should map events according the browser type", function(){
			eventPlugin.addEventListener(node, "mousedown", function(){}, "true");
			expect(node.addEventListener.mostRecentCall.args[0]).toBe("touchstart");
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
			expect(eventPlugin.addEventListener.wasCalled).toBe(true);
			expect(eventPlugin.addEventListener.mostRecentCall.args[0]).toBe(dom);
			expect(eventPlugin.addEventListener.mostRecentCall.args[1]).toBe("click");
			expect(eventPlugin.addEventListener.mostRecentCall.args[3]).toBe(true);

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
			expect(eventPlugin.addEventListener.wasCalled).toBe(true);
			expect(eventPlugin.addEventListener.mostRecentCall.args[0]).toBe(dom);
			expect(eventPlugin.addEventListener.mostRecentCall.args[1]).toBe("click");
			expect(eventPlugin.addEventListener.mostRecentCall.args[3]).toBe(true);
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
