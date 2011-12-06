require(["Olives/OObject", "TinyStore", "Tools"], function (OObject, TinyStore, Tools) {
	TestCase("OObjectTest", {

		setUp: function () {
			this.OObject = OObject;
		},
		
		"test OObject's model is a TinyStore": function () {
			var model = this.OObject.model,
				tinyStore = TinyStore.create(),
				tools = Tools;
			
			assertTrue(tools.compareObjects(tinyStore, model));
		}
	});

	TestCase("OObjectTemplateTest", {
		
		setUp: function () {
			this.OObject = OObject;
		},
		
		"test OObject has template property": function () {
			assertObject(this.OObject.template);
		},
		
		"test OObject has a place method to add the UI to the dom": function () {
			var domFragment = document.createDocumentFragment();
			
			this.OObject.template = document.createElement("p");
			this.OObject.template.id = "Text";
			
			assertFunction(this.OObject.place);

			assertSame(domFragment, this.OObject.place(domFragment));

			assertEquals(1, domFragment.querySelectorAll("p#Text").length);
		}
		
	});

	TestCase("OObjectLinksWithTemplate", {
		
		setUp: function () {
			var p;
			
			this.OObject = OObject;
			this.OObject.template = document.createElement("div");
			
			p = document.createElement("p");
			p.setAttribute("data-connect", "greetingz");
			this.OObject.template.appendChild(p);
			
			this.domFragment = document.createDocumentFragment();
			this.OObject.place(this.domFragment);
		},
		
		"test p greetingz exists in OObject": function () {
			assertObject(this.OObject.connects);
			assertInstanceOf(HTMLElement, this.OObject.connects["greetingz"]);
		}
	});
});