require(["Olives/List", "Olives/OObject"], function (List, OObject) {
	
	describe("ListTest", function () {
		
		it("should be an object with a create function", function () {
			expect(List).toBeInstanceOf(Object);
			expect(List.create).toBeInstanceOf(Function);
		});
		
	});
	
	describe("ListStructure", function () {
		
		var list = null;
		
		beforeEach(function () {
			list = List.create();
		});
		
		it("should inherit from OObject", function () {
			expect(OObject.isAugmenting(list)).toEqual(true);
		});
		
		it("should have an array as model", function () {
			expect(list.model).toBeInstanceOf(Array);
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
			
			expect(list.model).toBe(array);
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
			lis = list.dom.querySelectorAll("li");
			expect(lis.length).toEqual(2);
			expect(lis[0].innerHTML).toEqual(array[0]);
			expect(lis[1].innerHTML).toEqual(array[1]);
		});
		
	});
});