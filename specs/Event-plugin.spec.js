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
				this.listener = function() {
				};
			};
			ob = new _func();
			dom = document.createElement("button");
			eventPlugin = new EventPlugin(obj);
		});
		
		it("Link addEventListener with the dom"), function() {
			spyOn(dom,"addEventListener");
			eventPlugin.listen(dom,"click","listener","true");
			expect(dom.addEventListener.wasCalled).toEqual(true);
			expect(dom.addEventListener.mostRecentCall.args[0]).toEqual("click");
			expect(dom.addEventListener.mostRecentCall.args[1]).toEqual(obj["listener"]);
			expect(dom.addEventListener.mostRecentCall.args[2]).toEqual(true);
			
		});
	});
	
});