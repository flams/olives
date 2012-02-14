require(["Olives/OObject", "Tools", "Store", "CouchDBStore", "Olives/Plugins"], function (OObject, Tools, Store, CouchDBStore, Plugins) {
	
	describe("OObjectTest", function () {
		
		it("should be a constructor function", function () {
			expect(OObject).toBeInstanceOf(Function);
		});
		
		it("should give augmented UI the following API", function () {
			var UI = function () {};
			UI.prototype = new OObject;
			ui = new UI;
			
			expect(ui.template).toEqual(null);
			expect(ui.dom.isEqualNode(document.createElement("div"))).toEqual(true);
			expect(ui.onRender).toBeInstanceOf(Function);
			expect(ui.action).toBeInstanceOf(Function);
			expect(ui.onPlace).toBeInstanceOf(Function);
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
			var store = new CouchDBStore;
			oObject = new OObject(store);
			expect(oObject.model).toBe(store);
		});
		
		it("should init a basic store if the given object is not a store", function () {
			oObject = new OObject(true);
			expect(oObject.model).toBeInstanceOf(Store);
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
			ui.action("render");
			expect(ui.dom.querySelectorAll("p").length).toEqual(1);
			
		});
		
		it("should render a dom tree template", function () {
			ui.template = document.createElement("p");
			ui.action("render");
			expect(ui.dom.querySelectorAll("p").length).toEqual(1);
		});
		
		it("should allow for template modification", function () {
			ui.template = "<p></p>";
			ui.action("render");
			expect(ui.dom.querySelectorAll("p").length).toEqual(1);
			ui.template = "<p></p><p></p>";
			expect(ui.dom.querySelectorAll("p").length).toEqual(1);
			ui.action("render");
			expect(ui.dom.querySelectorAll("p").length).toEqual(2);
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
			var nodes;
			
			ui.template = "<div></div>";
			spyOn(ui.plugins, "apply");
			ui.action("render");
			
			expect(ui.plugins.apply.wasCalled).toEqual(true);	
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
		
		
		it("should not render if template is not set", function () {
			expect(function () { ui.action("render"); }).toThrow();
		});
		
		it("should trigger onRender after calling render", function () {
			ui.template = "<p></p>";
			spyOn(ui, "onRender");
			ui.action("render");
			expect(ui.onRender).toHaveBeenCalled();
			expect(ui.onRender.mostRecentCall.object).toBe(ui);
		});
		
		it("should trigger onPlace after place", function () {
			ui.template = "<p></p>";
			ui.action("render");
			spyOn(ui, "onPlace");
			ui.action("place");
			expect(ui.onPlace).toHaveBeenCalled();
		});
		
		it("should be able to place directly", function () {
			ui.template = "<p></p>";
			spyOn(ui, "onPlace");
			spyOn(ui, "onRender");
			ui.action("place");
			expect(ui.onRender).toHaveBeenCalled();
			expect(ui.onPlace).toHaveBeenCalled();
		});

	});
	
	describe("OObjectPlace", function () {
		
		var ui = null,
			UI = function () {};
		
		beforeEach(function () {
			UI.prototype = new OObject;
			ui = new UI;
		});
		
		it("should render&place the dom node at the given place", function () {
			var place = document.createElement("div"),
				template = document.createElement("p");
			
			ui.template = template;
			ui.action("place", place);
			
			expect(place.querySelectorAll("p").length).toEqual(1);
		});
		
		it("can take the UI from the DOM and place it somewhere else", function () {
			var place1 = document.createElement("div"),
				place2 = document.createElement("div"),
				template = document.createElement("p");
			
			ui.template = template;
			ui.action("place", place1);
			
			ui.action("place", place2);
			expect(place2.querySelectorAll("p").length).toEqual(1);
			expect(place1.querySelectorAll("p").length).toEqual(0);
		});
		
		it("should not break bindings while moving from a place to another", function () {
			var place1 = document.createElement("div"),
				place2 = document.createElement("div"),
				text = "Olives is cool!";
				template = "<p>" + text + "</p>";
			
				ui.template = template;
				ui.onRender = function () {
					this.p = this.dom.querySelector("p");
				};
			ui.action("place", place1);
			expect(ui.p.innerHTML).toEqual(text);
			ui.action("place", place2);
			ui.p.innerHTML = "test";
			expect(place2.querySelector("p").innerHTML).toEqual("test");
			
			ui.action("render");
			expect(place2.querySelector("p").innerHTML).toEqual(text);
			
		});
		
		it("shouldn't add unwated nodes", function () {
			var place = document.createElement("div");
			
			ui.template = document.createElement("p");
			ui.action("place", place);
			expect(place.querySelectorAll("*").length).toEqual(1);
		});
	});
	
	
});