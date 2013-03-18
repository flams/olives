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

		it("can be rerendered with a new template", function () {
			var oobject = new OObject(),
				div = document.createElement("div");

			oobject.template = div;

			oobject.render();

			oobject.template = "<p>";

			oobject.render();

			expect(oobject.dom.nodeName).toBe("P");

		});

		it("can be placed somewhere in the dom", function () {
			var oobject = new OObject(),
				parent = document.createElement("div"),
				child = document.createElement("p");

			oobject.template = child;

			oobject.render();

			oobject.place(parent);

			expect(parent.childNodes[0]).toBe(child);
		});

		it("can be moved around", function () {
			var oobject = new OObject(),
				parent1 = document.createElement("div"),
				parent2 = document.createElement("div"),
				parent3 = document.createElement("div"),
				child = document.createElement("p");

			oobject.template = child;

			oobject.render();

			oobject.place(parent1);
			expect(parent1.childNodes[0]).toBe(child);

			oobject.place(parent2);
			expect(parent1.childNodes.length).toBe(0);
			expect(parent2.childNodes[0]).toBe(child);
		});

		it("can be placed before an existing dom node", function () {
			var oobject = new OObject(),
				parent = document.createElement("div"),
				sibling = document.createElement("div"),
				child = document.createElement("p");

			parent.appendChild(sibling);

			oobject.template = child;

			oobject.render();

			oobject.place(parent, sibling);

			expect(parent.childNodes[0]).toBe(child);
			expect(parent.childNodes[1]).toBe(sibling);
		});

		it("calls render prior to place if the UI has never been rendered", function () {
			var oobject = new OObject,
				parent = document.createElement("div"),
				child = document.createElement("p");

			oobject.template = child;

			oobject.place(parent);

			expect(oobject.dom).toBe(child);
		});

		it("should throw an error if trying to render or place an oobject without specifying a template", function () {
			var oobject = new OObject;

			expect(function () {
				oobject.render();
			}).toThrow();
		});

		it("add behaviour to the template via plugins", function () {
			var oobject = new OObject();

			oobject.template = '<p data-i18n="translate: hello"></p>';
			oobject.plugins.add('i18n', {
				translate: function (dom, text) {
					if (text == "hello") {
						dom.innerHTML = "bonjour";
					}
				}
			});

			oobject.render();

			expect(oobject.dom.innerHTML).toBe("bonjour");
		});

		it("can create and render an OObject from existing DOM elements", function () {
			var oobject = new OObject(),
				dom = '<p data-i18n="translate: hello"></p>',
				parent = document.createElement("div");

			parent.innerHTML = dom;
			oobject.plugins.add('i18n', {
				translate: function (dom, text) {
					if (text == "hello") {
						dom.innerHTML = "bonjour";
					}
				}
			});

			oobject.alive(parent);

			expect(oobject.dom.querySelector("p").innerHTML).toBe("bonjour");
		});

	});

});
