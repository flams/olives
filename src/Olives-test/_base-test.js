TestCase("_baseTest", {

	setUp: function () {
		this._base = Olives.create("_base");
	},
	
	"test _base's model is a TinyStore": function () {
		var model = this._base.model,
			tinyStore = Emily.require("TinyStore").create(),
			tools = Emily.require("Tools");
		
		assertTrue(tools.compareObjects(tinyStore, model));
	}
	

	
});