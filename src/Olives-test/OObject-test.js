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
		assertUndefined(this.OObject.rootNode);
		
		this.OObject.template = uiTemplate;
		assertEquals(div, this.OObject.place(div));
		assertEquals(1, div.querySelectorAll("p#tag").length);
		
		assertSame(div, this.OObject.rootNode);
	}
	
});

TestCase("OObjectLinksWithTemplate", {
	
	setUp: function () {
		this.OObject = Olives.create("OObject");
		this.OObject.template = "<p data-connect='greetingz'>hello</p>\n<div data-connect='body'>how are you?</div>";
		
		this.div = document.createElement("div");
		this.OObject.place(this.div);
	},
	
	"test p greetingz exists in OObject": function () {
		assertObject(this.OObject.connects);
		assertInstanceOf(HTMLElement, this.OObject.connects["greetingz"]);
		assertInstanceOf(HTMLElement, this.OObject.connects["body"]);
	}
});