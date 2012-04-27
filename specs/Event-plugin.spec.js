/**
 * @license Olives http://flams.github.com/olives
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