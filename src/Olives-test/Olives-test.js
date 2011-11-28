TestCase("Olives", {
	
	setUp: function () {
		this.UI = function UI(API) {
			this.API = API;
		};
	},
	
	"test Olives is an object": function () {
		assertObject(Olives);
	},
	
	"test Olives API": function () {
		assertFunction(Olives.define);
		assertFunction(Olives.create);
	},
	
	"test define new UI": function () {
		assertFalse(Olives.define("UI"));
		assertFalse(Olives.define(this.UI));
		assertFalse(Olives.define(this.UI, "UI"));
		assertFalse(Olives.define("UI", {}));
		assertSame(this.UI, Olives.define("UI", this.UI));
	},

	
	"test create a new UI": function () {
		assertObject(Olives.create("UI"));
		assertSame(Emily, Olives.create("UI").API);
	},
	
	"test UI can inherit from others": function () {
		var obj = {},
			UI2 = function () {
				this.getObj = function () {
				return obj;
				};
			},
			ui;
		Olives.define("UI2", UI2);
		assertSame(this.UI, Olives.define("UI", "UI2", this.UI));
		
		ui = Olives.create("UI");
		
		assertSame(obj, ui.getObj());
	}

});