/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["OObject"],

function(OObject) {


	describe("OObject is a container for DOM elements and a starting point for adding it behaviour", function () {

		it("can accept DOM elements from an HTML template", function () {
			var oobject = new OObject();

			oobject.template = "<div></div>";

			expect(oobject.dom).toBe(null);

			// Render will take what's in template and turn it into
			// DOM elements
			oobject.render();

			// These DOM elements will be accessible via the .dom property
			expect(oobject.dom).toBeInstanceOf(HTMLElement);
			expect(oobject.dom.nodeName).toBe("DIV");
		});

		it("can accept actual DOM elements", function () {
			var oobject = new OObject(),
				div = document.createElement("div");

			oobject.template = div;

			oobject.render();

			expect(oobject.dom).toBe(div);
		});

	});

});
