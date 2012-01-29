require(["Olives/Type-plugin", "Olives/Plugins", "Olives/OObject"], function (TypePlugin, Plugins, OObject) {
	
	describe("TypePluginTest", function () {
		
		it("should be a constructor function", function () {
			expect(TypePlugin).toBeInstanceOf(Function);
		});
		
		it("should have the following api", function () {
			var typePlugin = new TypePlugin;
			expect(typePlugin.ui).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TypePluginUILoading", function () {
		
		var typePlugin = null,
			rootNode = null,
			plugins = null,
			ui = null;
		
		define("myUI", ["Olives/OObject"], function (OObject) {
			return function () {
				ui = Object.create(new OObject);
				ui.template = "<div></div>";
				spyOn(ui, "action").andCallThrough();
				return ui;
			};
		});
		
		beforeEach(function () {
			rootNode = document.createElement("div");
			rootNode.dataset["type"] = "ui:myUI";

			typePlugin = new TypePlugin;
			plugins = new Plugins;
			plugins.add("type", typePlugin);
		});
		
		it("should allow for loading a OObject's UI", function () {
			spyOn(typePlugin, "ui").andCallThrough();	
			plugins.apply(rootNode);
			expect(typePlugin.ui.callCount).toEqual(1);
			expect(ui).toBeTruthy();
			expect(ui.action.callCount).toEqual(1);
			expect(ui.action.mostRecentCall.args[0]).toEqual("place");
			expect(ui.action.mostRecentCall.args[1]).toBe(rootNode);
		});

	});
	
});