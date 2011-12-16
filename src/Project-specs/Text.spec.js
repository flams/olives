require(["Olives/Text", "Olives/OObject"], function (Text, OObject) {
	
	describe("TextTest", function () {
	
		it("should be an object with a create function", function () {
			expect(Text).toBeInstanceOf(Object);
			expect(Text.create).toBeInstanceOf(Function);
		});
		
		it("should inherit from OObject once created", function () {
			var text = Text.create();
			expect(OObject.isAugmenting(text)).toEqual(true);
		});
	});
	
	describe("TextInit", function () {
		
		var text = null;
		
		beforeEach(function() {
			text = Text.create();
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


	
});
