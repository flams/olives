require(["Olives/List", "Olives/OObject", "Store", "Tools"], function (List, OObject, Store, Tools) {
	
	describe("ListTest", function () {
		
		it("should be a constructor function", function () {
			expect(List).toBeInstanceOf(Function);
		});
		
		it("should inherit from OObject", function () {
			expect(new List).toBeInstanceOf(OObject);
		});
		
	});
	
	describe("ListStructure", function () {
		
		var list = null;
		
		beforeEach(function () {
			list = new List();
		});
		
		it("should have the following default template", function () {
			list.action("render");
			expect(list.dom.querySelectorAll("ul[data-model='toList']").length).toEqual(1);
		});
	});
	
	describe("ListInit", function () {
		
		it("should have its store init from create", function () {
			var array = ["Olives", "is cool!"], 
				list = new List(array);
			
			expect(list.model.get(0)).toBe(array[0]);
			expect(list.model.get(1)).toBe(array[1]);
		});
		
	});
	
	describe("ListDisplayItems", function () {
		
		var list = null,
			array = ["Olives", "is cool!"];
		
		beforeEach(function () {
			list = new List(array);
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
			list = new List(array);
		});
		
		it("should have a cutomizable template", function () {
			var ps;
			list.template = "<div data-model='toList'><p data-model='toText'></p></div>";
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
			
			list.template = "<div data-model='toList'>" +
					"<div><span data-model='toText:value.date'></span><span data-mode='toText:value.title'></span>" +
					"<p data-model='toText:value.body'></p></div>" +
					"</div>";
			
			list.action("render");

			expect(list.dom.querySelectorAll("div > p").length).toEqual(3);
			expect(list.dom.querySelectorAll("div > p")[1].innerHTML).toEqual(list.model.get(1).value.body);
		});
		
	});
	
	describe("ListDisplayUpdate", function () {
		
		var list = null,
		initialData = ["Olives", "is cool!"],
		resetData = ["Enjoy","it!", "pls"];
	
		beforeEach(function () {
			list = new List(initialData);
		});
		
		it("should update display when some data is updated", function () {
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
			list = new List(["Olives", "is cool!"]);
		});
		
		it("should add an item", function () {
			list.model.alter("push", "I");
			
			list.action("render");
			expect(list.dom.querySelectorAll("li")[2].innerHTML).toEqual("I");
		});
		
		it("should add an item when dom is rendered", function () {
			list.action("render");

			list.model.alter("push", "I");

			expect(list.dom.querySelectorAll("li")[2].innerHTML).toEqual("I");
		});
		
		it("should add an item between two other items", function () {
			list.model.alter("splice", 1, 0, "very");
			list.action("render");
			expect(list.dom.querySelectorAll("li")[1].innerHTML).toEqual("very");
			expect(list.dom.querySelectorAll("li")[2].innerHTML).toEqual("is cool!");
		});
		
		it("should remove an item", function () {
			list.action("render");
			list.model.alter("splice", 1, 1);
			expect(list.dom.querySelectorAll("li")[1]).toBeUndefined();
		});
		
		it("should remove multiple items", function () {
			list.model.alter("push", "innit!");
			list.action("render");
			list.model.alter("splice", 0, 2);
			expect(list.dom.querySelectorAll("li").length).toEqual(1);
			expect(list.dom.querySelectorAll("li")[0].innerHTML).toEqual("innit!");
			
			list.model.alter("pop");
			expect(list.dom.querySelectorAll("li").length).toEqual(0);
		});
	});

});