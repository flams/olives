require(["Olives/List", "Olives/OObject", "TinyStore", "Tools"], function (List, OObject, TinyStore, Tools) {
	
	describe("ListTest", function () {
		
		it("should be an object with a create function", function () {
			expect(List).toBeInstanceOf(Object);
			expect(List.create).toBeInstanceOf(Function);
		});
		
	});
	
	describe("ListStructure", function () {
		
		var list = null,
			data = ["Olives", "is cool!"];
		
		beforeEach(function () {
			list = List.create();
		});
		
		it("should inherit from OObject", function () {
			expect(OObject.isAugmenting(list)).toEqual(true);
		});
		
		it("should store data in a tinyStore", function () {
			expect(Tools.compareObjects(TinyStore.create(), list.model)).toEqual(true);
		});
		
		it("should have the following default template", function () {
			list.action("render");
			expect(list.dom.querySelectorAll("ul[data-connect='root']").length).toEqual(1);
		});
	});
	
	describe("ListInit", function () {
		
		it("should have its store init from create", function () {
			var array = ["Olives", "is cool!"], 
				list = List.create(array);
			
			expect(list.model.get(0)).toBe(array[0]);
			expect(list.model.get(1)).toBe(array[1]);
		});
		
	});
	
	describe("ListDisplayItems", function () {
		
		var list = null,
			array = ["Olives", "is cool!"];
		
		beforeEach(function () {
			list = List.create(array);
		});
		
		it("should render a list with what's in the model", function () {
			var lis;
			list.action("render");
			lis = list.dom.querySelectorAll("ul > li");
			expect(lis.length).toEqual(2);
			expect(lis[0].innerHTML).toEqual(array[0]);
			expect(lis[1].innerHTML).toEqual(array[1]);
		});
		
	});
	
	describe("ListDisplayCustom", function () {
		
		var list = null,
			array = ["Olives", "is cool", "and customizable"];
		
		beforeEach(function () {
			list = List.create(array);
		});
		
		it("should have a cutomizable template", function () {
			var ps;
			list.template = "<div data-connect='root'></div>";
			expect(list.itemRenderer).toBeInstanceOf(Function);
			list.itemRenderer = function (item) {
				var p = document.createElement("p");
				p.innerHTML = item;
				return p;
			};
			list.action("render");
			ps = list.dom.querySelectorAll("div > p");
			expect(ps[0].innerHTML).toEqual(array[0]);
			expect(ps[1].innerHTML).toEqual(array[1]);
			expect(ps[2].innerHTML).toEqual(array[2]);
		});
		
		it("should be able to handle db results", function () {
			list.model.reset([{"id":"e866ed6179417a05c6c93756a7000d0d","key":"e866ed6179417a05c6c93756a7000d0d","value":{"date":"2011/05/30 17:34:23","title":"fishing","body":"Fishing was fun"}},
			              {"id":"e866ed6179417a05c6c93756a7000d0e","key":"e866ed6179417a05c6c93756a7000d0e","value":{"date":"2011/04/06 08:10:00","title":"going to work","body":"That is fun too"}},
			              {"id":"e866ed6179417a05c6c93756a7000d0f","key":"e866ed6179417a05c6c93756a7000d0f","value":{"date":"2011/02/12 13:37:00","title":"hello world","body":"opened my new blog"}}]);
			
			list.template = "<div data-connect='root'></div>";
			
			list.itemRenderer = function (item) {
				var div = document.createElement("div"),
					h3 = document.createElement("h3"),
					p = document.createElement("p");
				
				h3.innerHTML = item.value.title + "<span>" + item.value.date + "</span>";
				p.innerHTML  = item.value.body;
				
				div.appendChild(h3);
				div.appendChild(p);
				return div;
			};
			
			list.action("render");
			expect(list.dom.querySelectorAll("div > h3 > span").length).toEqual(3);
			expect(list.dom.querySelectorAll("div > p")[1].innerHTML).toEqual(list.model.get(1).value.body);
		});
		
	});
	
	describe("ListDisplayUpdate", function () {
		
		var list = null,
		initialData = ["Olives", "is cool!"],
		resetData = ["Enjoy","it!"];
	
		beforeEach(function () {
			list = List.create(initialData);
		});
		
		it("should update display when a piece data is updated", function () {
			list.action("render");
			list.model.set(1, "is very cool!");
			expect(list.dom.querySelectorAll("li")[1].innerHTML).toEqual("is very cool!");
		});
		
		it("should update the whole display when all data is updated", function () {
			list.action("render");
			list.model.reset(resetData);
			list.action("render");
			expect(list.dom.querySelectorAll("li")[1].innerHTML).toEqual("it!");
		});
		
	});
	
	describe("ListModelAddItem", function () {
		
		var list = null;
		
		beforeEach(function () {
			list = List.create(["Olives", "is cool!"]);
		});
		
		it("should add an item", function () {
			list.model.set(2, "I");
			
			list.action("render");
			expect(list.dom.querySelectorAll("li")[2].innerHTML).toEqual("I");
		});
		
		it("should add an item when dom is rendered", function () {
			list.action("render");
			list.model.set(2, "I");
			expect(list.dom.querySelectorAll("li")[2].innerHTML).toEqual("I");
		});
		
		it("should add an item between two other items", function () {
			list.model.set(1, "very");

		});
		
	});
	
});