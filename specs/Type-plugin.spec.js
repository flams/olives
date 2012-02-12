require(["Olives/Type-plugin", "Olives/Plugins", "Olives/OObject"], function (TypePlugin, Plugins, OObject) {
	
	describe("TypePluginTest", function () {
		
		it("should be a constructor function", function () {
			expect(TypePlugin).toBeInstanceOf(Function);
		});
		
		it("should have the following api", function () {
			var typePlugin = new TypePlugin;
			expect(typePlugin.place).toBeInstanceOf(Function);
			expect(typePlugin.set).toBeInstanceOf(Function);
			expect(typePlugin.setAll).toBeInstanceOf(Function);
			expect(typePlugin.get).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TypePluginRegister", function () {
		
		var typePlugin = null,
			falseUI = {},
			rightUI = new OObject;
		
		beforeEach(function () {
			typePlugin = new TypePlugin;
		});
		
		it("should set a new ui", function () {
			expect(typePlugin.set("ui")).toEqual(false);
			expect(typePlugin.set()).toEqual(false);
			expect(typePlugin.set("ui", "ui")).toEqual(false);
			expect(typePlugin.set("ui", falseUI)).toEqual(false);
			expect(typePlugin.set("ui", rightUI)).toEqual(true);
		});
		
		it("should get a set ui", function () {
			typePlugin.set("ui", rightUI);
			expect(typePlugin.get("ui")).toBe(rightUI);
		});
		
		it("should set multiple uis at once", function () {
			var uis = {
					"myUI1": new OObject,
					"myUI2": new OObject
				};
			
			typePlugin.setAll(uis);
			expect(typePlugin.get("myUI1")).toBe(uis.myUI1);
			expect(typePlugin.get("myUI2")).toBe(uis.myUI2);
		});

	});
	
	describe("TypePluginInit", function () {
		
		var typePlugin = null,
			uis = {
				"myUI1": new OObject,
				"myUI2": new OObject
			};
		
		it("should allow for initializing typePlugin with multiple UIs", function () {
			typePlugin = new TypePlugin(uis);
			
			expect(typePlugin.get("myUI1")).toBe(uis.myUI1);
			expect(typePlugin.get("myUI2")).toBe(uis.myUI2);
		});
		
	});
	
	
	describe("TypePluginUILoading", function () {
		
		var typePlugin = null,
			myUI = new OObject,
			node = document.createElement("div");
		
		beforeEach(function () {
			typePlugin = new TypePlugin;
			typePlugin.set("myUI", myUI);
			
		});
		
		it("should call the place method of an ui", function () {
			spyOn(myUI, "action");
			typePlugin.place(node, "myUI");
			expect(myUI.action.wasCalled).toEqual(true);
			expect(myUI.action.mostRecentCall.args[0]).toEqual("place");
			expect(myUI.action.mostRecentCall.args[1]).toBe(node);
		});
		
		it("should throw an exception if the ui is not registered", function () {
			expect(function () {
				typePlugin.place(node, "missing");
			}).toThrow();
		});
			
	});
	
});