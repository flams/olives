/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["OObject", "Tools", "Store", "Plugins"], function (OObject, Tools, Store, Plugins) {

	describe("OObjectTest", function () {

		it("should be a constructor function", function () {
			expect(OObject).toBeInstanceOf(Function);
		});

		it("should give augmented UI the following API", function () {
			var UI = function () {};
			UI.prototype = new OObject;
			ui = new UI;

			expect(ui.template).toBe(null);
			expect(ui.dom).toBe(null);
			expect(ui.render).toBeInstanceOf(Function);
			expect(ui.place).toBeInstanceOf(Function);
			expect(ui.alive).toBeInstanceOf(Function);
			expect(ui.setTemplateFromDom).toBeInstanceOf(Function);
			expect(ui.getCurrentPlace).toBeInstanceOf(Function);
		});

		it("should have a plugins property that is a Plugins aggragator", function () {
			expect(ui.plugins).toBeInstanceOf(Plugins);
		});

	});

	describe("OObjectModel", function () {

		var oObject = null;

		beforeEach(function () {
			oObject = null;
		});

		it("should have a model property that is a store", function () {
			oObject = new OObject;
			expect(oObject.model).toBeInstanceOf(Store);
		});

		it("should allow for changing the model at init", function () {
			var store = new Store;
			oObject = new OObject(store);
			expect(oObject.model).toBe(store);
		});

		it("should init a basic store if the given object is not a store", function () {
			oObject = new OObject(true);
			expect(oObject.model).toBeInstanceOf(Store);
		});

	});

	describe("OObjectAlive", function () {

		var oObject = null,
			dom = document.createElement("div");

		beforeEach(function () {
			oObject = new OObject;
			dom.innerHTML = "<p><span>Olives</span></p><p><span>Emily</span></p>";
		});

		it("should transform a dom node into a UI", function () {
			expect(oObject.alive).toBeInstanceOf(Function);
			spyOn(oObject, "setTemplateFromDom");
			spyOn(oObject, "place");

			expect(oObject.alive({})).toBe(false);
			expect(oObject.alive(dom.querySelector("p"))).toBe(true);

			expect(oObject.setTemplateFromDom.wasCalled).toBe(true);
			expect(oObject.setTemplateFromDom.mostRecentCall.args[0]).toBe(dom.querySelector("p"));

			expect(oObject.place.wasCalled).toBe(true);
			expect(oObject.place.mostRecentCall.args[0]).toBe(dom);
			expect(oObject.place.mostRecentCall.args[1]).toBe(dom.querySelectorAll("p")[1]);
		});

	});

	describe("OObjectTemplating", function () {

		var ui = null,
			UI = function () {};

		beforeEach(function () {
			UI.prototype = new OObject;
			ui = new UI;
		});

		it("should render a string template ", function () {
			ui.template = "<p></p>";
			ui.render();
			expect(ui.dom.isEqualNode(document.createElement("p"))).toBe(true);

		});

		it("should render a dom tree template", function () {
			ui.template = document.createElement("p");
			ui.render();
			expect(ui.dom.isEqualNode(document.createElement("p"))).toBe(true);
		});

		it("should allow for template modification", function () {
			ui.template = "<p></p>";
			ui.render();
			expect(ui.dom.isEqualNode(document.createElement("p"))).toBe(true);
			ui.template = "<p><span></span></p>";

			ui.render();
			expect(ui.dom.querySelectorAll("span").length).toBe(1);
		});

		it("shouldn't accept templates with more than one parentNode", function () {
			ui.template = "<p></p><p></p>";
			expect(function () {
				ui.render();
			}).toThrow();
		});

		it("should update the template after the UI was placed somewhere else", function () {
			var place1 = document.createElement("div"),
				place2 = document.createElement("div");

			ui.template = "<p></p>";
			ui.render();
			ui.place( place1);
			ui.place( place2);

			ui.template = "<p><span></span></p>";
			expect(ui.render());

			expect(place2.querySelectorAll("span").length).toBe(1);
		});

		it("should get the template from a DOM node", function () {
			var domNode = document.createElement("div");
			expect(ui.setTemplateFromDom()).toBe(false);
			expect(ui.setTemplateFromDom({})).toBe(false);
			expect(ui.setTemplateFromDom(domNode)).toBe(true);
			expect(ui.template).toBe(domNode);
		});

	});

	describe("OObjectPlugins", function () {

		var ui = null,
		UI = function () {};

		beforeEach(function () {
			UI.prototype = new OObject;
			ui = new UI;
		});

		it("should apply plugins on render", function () {
			ui.template = "<div></div>";
			spyOn(ui.plugins, "apply");
			ui.render();

			expect(ui.plugins.apply.wasCalled).toBe(true);
			expect(ui.plugins.apply.mostRecentCall.args[0]).toBe(ui.dom);
		});

	});

	describe("OObjectLifeCycle", function () {

		var ui = null,
		UI = function () {};

		beforeEach(function () {
			UI.prototype = new OObject;
			ui = new UI;
		});


		it("should throw error if template is not set", function () {
			expect(function () { ui.render(); }).toThrow();
		});

		it("should be able to place directly", function () {
			ui.template = "<p></p>";
			ui.place();
			expect(ui.dom.isEqualNode(document.createElement("p"))).toBe(true);
		});

	});

	describe("OObjectPlace", function () {

		var ui = null,
			UI = function () {},
			place1 = null,
			place2 = null;

		beforeEach(function () {
			UI.prototype = new OObject;
			UI.prototype.template = "<p>Olives</p>";
			ui = new UI;

			place1 = document.createElement("div");
			place2 = document.createElement("div");
		});

		it("should render&place the dom node at the given place", function () {
			ui.place(place1);

			expect(place1.querySelectorAll("p").length).toBe(1);
		});

		it("should take the UI from the DOM and place it somewhere else", function () {
			ui.place( place1);

			ui.place( place2);
			expect(place2.querySelectorAll("p").length).toBe(1);
			expect(place1.querySelectorAll("p").length).toBe(0);
		});

		it("should place a UI between two dom nodes", function () {
			var place3 = document.createElement("div"),
				place4 = document.createElement("div");

			place2.appendChild(place3);
			place2.appendChild(place4);

			ui.place(place2, place4);

			expect(place2.childNodes[0]).toBe(place3);
			expect(place2.childNodes[1]).toBe(ui.dom);
			expect(place2.childNodes[2]).toBe(place4);

		});


		it("shouldn't move siblings UI when moving one somewhere else", function () {
			var UI2 = function(){},
				ui2;

			UI2.prototype = new OObject;
			ui2 = new UI2;
			ui2.template = "<p>Emily</p>";

			ui.place( place1);
			ui2.place( place1);

			ui2.place( place2);

			expect(place2.querySelector("p").innerHTML).toBe("Emily");
			expect(place1.querySelector("p").innerHTML).toBe("Olives");

			ui.place(place2);
			expect(place1.querySelectorAll("p").length).toBe(0);

			ui.place(place1);

			expect(place2.querySelector("p").innerHTML).toBe("Emily");
			expect(place1.querySelector("p").innerHTML).toBe("Olives");

		});

		it("should not break bindings while moving from a place to another", function () {
			var template = "<div><p>Olives is cool!</p></div>",
				p;

			ui.template = template;
			ui.place(place1);

			// Wherever the UI is placed, p shouldn't change
			p = ui.dom.querySelector("p");

			ui.place(place2);

			expect(place2.querySelector("p")).toBe(p);

		});

		it("shouldn't add unwated nodes", function () {
			ui.template = document.createElement("p");
			ui.place(place1);
			expect(place1.querySelectorAll("*").length).toBe(1);
		});


	});

	describe("GetCurrentPlace", function(){
		it("should return the current place", function(){
			var ui = new OObject(),
				place1 = document.createElement("div"),
				place2 = document.createElement("div");
			ui.template = "<p>olives</p>";

			expect(ui.getCurrentPlace()).toBe(null);
			ui.place(place1);
			expect(ui.getCurrentPlace()).toBe(place1);
			ui.place(place2);
			expect(ui.getCurrentPlace()).toBe(place2);
		});
	});


});
