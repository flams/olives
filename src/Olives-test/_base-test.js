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

TestCase("_baseTemplateTest", {
	
	setUp: function () {
		this._base = Olives.create("_base");
	},
	
	"test _base has a template property": function () {
		assertString(this._base.template);
	},
	
	"test _base has a place method to add the UI to the dom": function () {
		var div = document.createElement("div"),
			uiTemplate = '<p id="tag">hello</p>';
		
		assertFunction(this._base.place);
		this._base.template = uiTemplate;
		assertEquals(this._base, this._base.place(div));
		assertEquals(1, div.querySelectorAll("p#tag").length);
	}
	
});

TestCase("_baseTemplateBinding", {

	setUp: function () {
		this._base = Olives.create("_base");
		this.div = document.createElement("div");
		this._base.template = '<p data-bind="greetingz">hello</p>';
		this._base.place(this.div);
	},
	
	"test _base template can bind view to model": function () {
		assertTrue(this._base.model.has("greetingz"));
		assertEquals("hello", this._base.model.get("greetingz"));
	},
	
	"test _base template view is updated on model change": function () {
		this._base.model.set("greetingz", "Olives is cool");
		assertSame("Olives is cool", this.div.querySelector("p").innerHTML);
	}
	
});