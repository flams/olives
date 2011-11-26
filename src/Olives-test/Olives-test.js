TestCase("Olives", {
	
	setUp: function () {
		this.UI = function UI(API) {
			this.API = API;
		};
	},
	
	"test Olives is an object": function () {
		assertObject(Olives);
	},
	
	"test Olives has declare function": function () {
		assertFunction(Olives.declare);
	},
	
	"test declare new UI": function () {
		assertFalse(Olives.declare("UI"));
		assertFalse(Olives.declare(this.UI));
		assertFalse(Olives.declare(this.UI, "UI"));
		assertFalse(Olives.declare("UI", {}));
		assertSame(this.UI, Olives.declare("UI", this.UI));
	},
	
	"test require a declared UI": function () {
		assertSame(Emily, Olives.require("UI").API);
	}

});