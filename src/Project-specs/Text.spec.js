require(["Olives/Text", "Olives/OObject"], function (Text, OObject) {
	
	describe("TextTest", function () {
	
		it("should be an object with a create function", function () {
			expect(Text).toBeInstanceOf(Object);
			expect(Text.create).toBeInstanceOf(Function);
		});
		
		it("once created, text should inherit from OObject", function () {
			var text = Text.create();
			expect(Object.getPrototypeOf(text)).toBe(OObject);
		});
	});


	
});
