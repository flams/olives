require(["Olives/Model-plugin"], function (ModelPlugin) {
	
	describe("ModelPluginTest", function () {
		it("should be a constructor function", function () {
			expect(ModelPlugin).toBeInstanceOf(Function);
		});
		
		it("should have the following API", function () {
			var modelPlugin = new ModelPlugin();
			
			expect(modelPlugin.toText).toBeInstanceOf(Function);
			expect(modelPlugin.toList).toBeInstanceOf(Function);
		});
	});
	
});