require(["Olives/Text", "Olives/OObject"], function (Text, OObject) {
	
	describe("TextTest", function () {
	
		it("should be an object with a create function", function () {
			expect(Text).toBeInstanceOf(Object);
			expect(Text.create).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TextStructure", function () {

		var text = null;
		
		beforeEach(function() {
			text = Text.create();
		});		
		
		it("should inherit from OObject once created", function () {
			var text = Text.create();
			expect(OObject.isAugmenting(text)).toEqual(true);
		});

		it("should have only one p tag in its rendered dom", function () {
			text.action("render");
			expect(text.dom.querySelectorAll("p").length).toEqual(1);
		});
		
		it("should have a provide function to provide data", function () {
			expect(text.provide).toBeInstanceOf(Function);
			expect(text.provide("new content")).toEqual(true);
			expect(text.model.get("content")).toEqual("new content");
		});
		
	});
	
	describe("TextContent", function () {
		
		var text = null,
			content = "Olives is cool!";
		
		beforeEach(function () {
			text = Text.create(content);
		});
		
		it("should pass the content at creation", function () {
			expect(text.model.get("content")).toEqual(content);
			text.action("render");
			expect(text.dom.querySelector("[data-connect='content']").innerHTML).toEqual(content);
		});
		
		it("should connect the model to the dom on first render", function () {
			text.provide("shouldn't crash");
			expect(text.dom).toEqual(null);
			text.action("render");
			expect(text.dom.querySelector("[data-connect='content']").innerHTML).toEqual("shouldn't crash");
		});
		
		it("should have its p tag's innerHTML connected to the model", function () {
			text.action("render");
			var p = text.dom.querySelector("p[data-connect]");
			text.provide("Olives is cool!");
			expect(p.innerHTML).toEqual("Olives is cool!");
			text.provide("This one's just for fun!");
			expect(p.innerHTML).toEqual("This one's just for fun!");
		});
		
		it("should always reflect the model's value", function () {
			text.action("render");

			text.provide("new text");
			expect(text.dom.querySelector("p[data-connect]").innerHTML).toEqual("new text");
			
			text.template = "<p data-connect='content'></p>";
			text.action("render");
			expect(text.dom.querySelector("p[data-connect]").innerHTML).toEqual("new text");

			text.provide("should work");
			expect(text.dom.querySelector("p[data-connect]").innerHTML).toEqual("should work");
		});


		
	});


	
});
