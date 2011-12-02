TestCase("OObjectTest", {

	setUp: function () {
		this.OObject = Olives.create("OObject");
	},
	
	"test OObject's model is a TinyStore": function () {
		var model = this.OObject.model,
			tinyStore = Emily.require("TinyStore").create(),
			tools = Emily.require("Tools");
		
		assertTrue(tools.compareObjects(tinyStore, model));
	}
});

TestCase("OObjectTemplateTest", {
	
	setUp: function () {
		this.OObject = Olives.create("OObject");
	},
	
	"test OObject has a template property": function () {
		assertString(this.OObject.template);
	},
	
	"test OObject has a place method to add the UI to the dom": function () {
		var div = document.createElement("div"),
			uiTemplate = '<p id="tag">hello</p>';
		
		assertFunction(this.OObject.place);
		this.OObject.template = uiTemplate;
		assertEquals(this.OObject, this.OObject.place(div));
		assertEquals(1, div.querySelectorAll("p#tag").length);
	}
	
});

TestCase("OObjectTemplateBinding", {

	setUp: function () {
		this.OObject = Olives.create("OObject");
		this.div = document.createElement("div");
		this.OObject.template = '<p data-bind="greetingz">hello</p>';
		this.OObject.place(this.div);
	},
	
	"test OObject template can bind view to model": function () {
		assertTrue(this.OObject.model.has("greetingz"));
		assertEquals("hello", this.OObject.model.get("greetingz"));
	},
	
	"test OObject template view is updated on model change": function () {
		this.OObject.model.set("greetingz", "Olives is cool");
		assertSame("Olives is cool", this.div.querySelector("p").innerHTML);
	}
	
});