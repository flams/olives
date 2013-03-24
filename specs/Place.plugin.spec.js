/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["Place.plugin", "Plugins", "OObject"], function (PlacePlugin, Plugins, OObject) {

	describe("PlacePluginTest", function () {

		it("should be a constructor function", function () {
			expect(PlacePlugin).toBeInstanceOf(Function);
		});

		it("should have the following api", function () {
			var placePlugin = new PlacePlugin;
			expect(placePlugin.place).toBeInstanceOf(Function);
			expect(placePlugin.set).toBeInstanceOf(Function);
			expect(placePlugin.setAll).toBeInstanceOf(Function);
			expect(placePlugin.get).toBeInstanceOf(Function);
		});

	});

	describe("PlacePluginRegister", function () {

		var placePlugin = null,
			falseUI = {},
			rightUI = new OObject;

		beforeEach(function () {
			placePlugin = new PlacePlugin;
		})
		it("should set a new ui", function () {
			expect(placePlugin.set("ui")).toBe(false);
			expect(placePlugin.set()).toBe(false);
			expect(placePlugin.set("ui", "ui")).toBe(false);
			expect(placePlugin.set("ui", falseUI)).toBe(false);
			expect(placePlugin.set("ui", rightUI)).toBe(true);
		});

		it("should get a set ui", function () {
			placePlugin.set("ui", rightUI);
			expect(placePlugin.get("ui")).toBe(rightUI);
		});

		it("should set multiple uis at once", function () {
			var uis = {
					"myUI1": new OObject,
					"myUI2": new OObject
				};

			placePlugin.setAll(uis);
			expect(placePlugin.get("myUI1")).toBe(uis.myUI1);
			expect(placePlugin.get("myUI2")).toBe(uis.myUI2);
		});

	});

	describe("PlacePluginInit", function () {

		var placePlugin = null,
			uis = {
				"myUI1": new OObject,
				"myUI2": new OObject
			};

		it("should allow for initializing placePlugin with multiple UIs", function () {
			placePlugin = new PlacePlugin(uis);

			expect(placePlugin.get("myUI1")).toBe(uis.myUI1);
			expect(placePlugin.get("myUI2")).toBe(uis.myUI2);
		});

	});


	describe("PlacePluginUILoading", function () {

		var placePlugin = null,
			myUI = new OObject,
			node = document.createElement("div");

		beforeEach(function () {
			placePlugin = new PlacePlugin;
			placePlugin.set("myUI", myUI);

		});

		it("should call the place method of an ui", function () {
			spyOn(myUI, "place");
			placePlugin.place(node, "myUI");
			expect(myUI.place.wasCalled).toBe(true);
			expect(myUI.place.mostRecentCall.args[0]).toBe(node);
		});

		it("should throw an exception if the ui is not registered", function () {
			expect(function () {
				placePlugin.place(node, "missing");
			}).toThrow();
		});

	});

});
