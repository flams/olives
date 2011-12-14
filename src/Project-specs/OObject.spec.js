require(["Olives/OObject", "TinyStore", "Tools"], function (OObject, TinyStore, Tools) {
	
	describe("OObjectTest", function () {
		
		it("should be an object", function () {
			expect(OObject).toBeInstanceOf(Object);
		});
		
		it("should have a model property that's a TinyStore", function () {
			expect(Tools.compareObjects(OObject.model, TinyStore.create())).toEqual(true); 
		});
	});
	
});