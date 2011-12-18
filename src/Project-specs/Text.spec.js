require(["Olives/Text", "Olives/OObject"], function (Text, OObject) {
	
	describe("TextTest", function () {
	
		var text = null;
		
		beforeEach(function() {
			text = Text.create();
		});
		
		it("should be an object with a create function", function () {
			expect(Text).toBeInstanceOf(Object);
			expect(Text.create).toBeInstanceOf(Function);
		});
		
		it("should inherit from OObject once created", function () {
			var text = Text.create();
			expect(OObject.isAugmenting(text)).toEqual(true);
		});

		it("should have only one p tag in its rendered dom", function () {
			text.action("render");
			expect(text.dom.querySelectorAll("p").length).toEqual(1);
		});
		
		it("should have its p tag's innerHTML connected to the model", function () {
			text.action("render");
			var p = text.dom.querySelector("p[data-connect]"),
				name = p.getAttribute("data-connect");
			text.model.set(name, "Olives is cool!");
			expect(p.innerHTML).toEqual("Olives is cool!");
			text.model.set(name, "This one's just for fun!");
			expect(p.innerHTML).toEqual("This one's just for fun!");
		});
		
	});
	
	describe("TextContent", function () {
		
		var text = null,
			content = "Olives is cool!";
		
		beforeEach(function () {
			text = Text.create(content);
		});
		
		it("should be cool from the begining", function () {
			text.action("render");
			expect(text.model.get("content")).toEqual(content);
			expect(text.dom.querySelector("[data-connect='content']").innerHTML).toEqual(content);
		});
		
		it("should always reflect the model's value", function () {
			var innerHTML = function () {
					return text.dom.querySelector("[data-connect]").innerHTML;
				};
			text.action("render");
			text.model.set("content", "new text");
			expect(innerHTML()).toEqual("new text");
			
			text.template = "<p data-connect='content'></p>";
			text.action("render");
			expect(innerHTML()).toEqual("new text");

			text.model.set("content", "should work");
			expect(innerHTML()).toEqual("should work");
		});

		
	});


	
});
