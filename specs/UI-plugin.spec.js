/**
 * @license Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["Olives/UI-plugin", "Olives/Plugins", "Olives/OObject"], function (UIPlugin, Plugins, OObject) {
	
	describe("UIPluginTest", function () {
		
		it("should be a constructor function", function () {
			expect(UIPlugin).toBeInstanceOf(Function);
		});
		
		it("should have the following api", function () {
			var uiPlugin = new UIPlugin;
			expect(uiPlugin.place).toBeInstanceOf(Function);
			expect(uiPlugin.set).toBeInstanceOf(Function);
			expect(uiPlugin.setAll).toBeInstanceOf(Function);
			expect(uiPlugin.get).toBeInstanceOf(Function);
		});
		
	});
	
	describe("UIPluginRegister", function () {
		
		var uiPlugin = null,
			falseUI = {},
			rightUI = new OObject;
		
		beforeEach(function () {
			uiPlugin = new UIPlugin;
		});
		
		it("should set a new ui", function () {
			expect(uiPlugin.set("ui")).toEqual(false);
			expect(uiPlugin.set()).toEqual(false);
			expect(uiPlugin.set("ui", "ui")).toEqual(false);
			expect(uiPlugin.set("ui", falseUI)).toEqual(false);
			expect(uiPlugin.set("ui", rightUI)).toEqual(true);
		});
		
		it("should get a set ui", function () {
			uiPlugin.set("ui", rightUI);
			expect(uiPlugin.get("ui")).toBe(rightUI);
		});
		
		it("should set multiple uis at once", function () {
			var uis = {
					"myUI1": new OObject,
					"myUI2": new OObject
				};
			
			uiPlugin.setAll(uis);
			expect(uiPlugin.get("myUI1")).toBe(uis.myUI1);
			expect(uiPlugin.get("myUI2")).toBe(uis.myUI2);
		});

	});
	
	describe("UIPluginInit", function () {
		
		var uiPlugin = null,
			uis = {
				"myUI1": new OObject,
				"myUI2": new OObject
			};
		
		it("should allow for initializing uiPlugin with multiple UIs", function () {
			uiPlugin = new UIPlugin(uis);
			
			expect(uiPlugin.get("myUI1")).toBe(uis.myUI1);
			expect(uiPlugin.get("myUI2")).toBe(uis.myUI2);
		});
		
	});
	
	
	describe("UIPluginUILoading", function () {
		
		var uiPlugin = null,
			myUI = new OObject,
			node = document.createElement("div");
		
		beforeEach(function () {
			uiPlugin = new UIPlugin;
			uiPlugin.set("myUI", myUI);
			
		});
		
		it("should call the place method of an ui", function () {
			spyOn(myUI, "place");
			uiPlugin.place(node, "myUI");
			expect(myUI.place.wasCalled).toEqual(true);
			expect(myUI.place.mostRecentCall.args[0]).toBe(node);
		});
		
		it("should throw an exception if the ui is not registered", function () {
			expect(function () {
				uiPlugin.place(node, "missing");
			}).toThrow();
		});
			
	});
	
});