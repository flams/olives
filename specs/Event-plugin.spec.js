require(["Olives/Event-plugin", "Store", "Olives/OObject", "Olives/Plugins"], function (EventPlugin, Store, OObject, Plugins) {
	
	describe("EventPluginTest", function () {
		
		it("should be a constructor function", function () {
			expect(EventPlugin).toBeInstanceOf(Function);
		});
		
		it("Should have the following API", function() {
			var eventPlugin = new EventPlugin();
			expect(eventPlugin.listen).toBeInstanceOf(Function);
		});
		
	});
	
});