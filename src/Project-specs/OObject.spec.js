require(["Olives/OObject", "TinyStore", "Tools"], function (OObject, TinyStore, Tools) {
	
	describe("OObjectTest", function () {
		
		var UI = function UI() {};
		
		it("should be an object with an extend function", function () {
			expect(OObject).toBeInstanceOf(Object);
			expect(OObject.augment).toBeInstanceOf(Function);
		});
		
		it("should make UIs inherit from it", function () {
			var augmentedUI = OObject.augment(UI),
				fake = function UI() {};
				
			expect(OObject.isAugmenting(augmentedUI)).toEqual(true);
			expect(OObject.isAugmenting(new augmentedUI)).toEqual(true);
			expect(OObject.isAugmenting(fake)).toEqual(false);
		});
		
		it("should give augmented UI the following API", function () {
			UI = OObject.augment(UI),
			UI = new UI;
			
			expect(UI.model).toBeInstanceOf(Object);
			expect(Tools.compareObjects(TinyStore.create(), UI.model)).toEqual(true);
			
			expect(UI.template).toEqual(null);
			expect(UI.dom).toEqual(null);
			expect(UI.onRender).toBeInstanceOf(Function);
			expect(UI.action).toBeInstanceOf(Function);
			expect(UI.onPlace).toBeInstanceOf(Function);
			expect(UI.connects).toBeInstanceOf(Object);
		});

	});
	
	describe("OObjectTemplating", function () {
		
		var UI = null;
		
		beforeEach(function () {
			UI = OObject.augment(function () {});
			UI = new UI;
		});
		
		it("should render a string template ", function () {
			UI.template = "<p></p>";
			UI.action("render");
			expect(UI.dom.querySelectorAll("p").length).toEqual(1);
			
		});
		
		it("should render a dom tree template", function () {
			UI.template = document.createElement("p");
			UI.action("render");
			expect(UI.dom.querySelectorAll("p").length).toEqual(1);
		});
		
		it("should allow for template modification", function () {
			UI.template = "<p></p>";
			UI.action("render");
			expect(UI.dom.querySelectorAll("p").length).toEqual(1);
			UI.template = "<p></p><p></p>";
			expect(UI.dom.querySelectorAll("p").length).toEqual(1);
			UI.action("render");
			expect(UI.dom.querySelectorAll("p").length).toEqual(2);
		});
		
	});
	
	
	describe("OObjectLifeCycle", function () {
		
		var UI = null;
		
		beforeEach(function () {
			UI = OObject.augment(function () {});
			UI = new UI;
			
		});
		
		it("should not render if template is not set", function () {
			expect(function () { UI.action("render"); }).toThrow();
		});
		
		it("should trigger onRender after calling render", function () {
			UI.template = "<p></p>";
			spyOn(UI, "onRender");
			UI.action("render");
			expect(UI.onRender).toHaveBeenCalled();
			expect(UI.onRender.mostRecentCall.object).toBe(UI);
		});
		
		it("should trigger onPlace after place", function () {
			UI.template = "<p></p>";
			UI.action("render");
			spyOn(UI, "onPlace");
			UI.action("place");
			expect(UI.onPlace).toHaveBeenCalled();
		});
		
		it("should be able to place directly", function () {
			UI.template = "<p></p>";
			spyOn(UI, "onPlace");
			spyOn(UI, "onRender");
			UI.action("place");
			expect(UI.onRender).toHaveBeenCalled();
			expect(UI.onPlace).toHaveBeenCalled();
		});

	});
	
	describe("OObjectPlace", function () {
		
		var UI = null;
		
		beforeEach(function () {
			UI = OObject.augment(function () {});
			UI = new UI;
			
		});
		
		it("should render&place the dom node at the given place", function () {
			var place = document.createElement("div"),
				template = document.createElement("p");
			
			UI.template = template;
			UI.action("place", place);
			
			expect(place.querySelectorAll("p").length).toEqual(1);
		});
		
		it("can take the UI from the DOM and place it somewhere else", function () {
			var place1 = document.createElement("div"),
				place2 = document.createElement("div"),
				template = document.createElement("p");
			
			UI.template = template;
			UI.action("place", place1);
			
			UI.action("place", place2);
			expect(place2.querySelectorAll("p").length).toEqual(1);
			expect(place1.querySelectorAll("p").length).toEqual(0);
		});
		
		it("should not break bindings while moving from a place to another", function () {
			var place1 = document.createElement("div"),
				place2 = document.createElement("div"),
				text = "Olives is cool!";
				template = "<p>" + text + "</p>";
			
			UI.template = template;
			UI.onRender = function () {
				this.p = this.dom.querySelector("p");
			};
			UI.action("place", place1);
			expect(UI.p.innerHTML).toEqual(text);
			UI.action("place", place2);
			UI.p.innerHTML = "test";
			expect(place2.querySelector("p").innerHTML).toEqual("test");
			
			UI.action("render");
			expect(place2.querySelector("p").innerHTML).toEqual(text);
			
		});
	});
	
	
	describe("OOBjectConnects", function () {
		
		var UI = null;
		
		beforeEach(function () {
			UI = OObject.augment(function () {});
			UI = new UI;
			UI.template = "<p data-connect='content'></p>";
		});
		
		it("should list data-connect", function () {
			UI.action("render");
			expect(UI.connects["content"]).toBe(UI.dom.querySelector("p[data-connect='content']"));
		});
		
	});
	
	
});