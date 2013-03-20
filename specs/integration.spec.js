/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["OObject", "Plugins"],

function(OObject, Plugins) {

	function CreateMouseEvent(type) {
		var event = document.createEvent("MouseEvent");
		event.initEvent(type, true, true);
		return event;
	}


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

		it("can return the current place", function () {
			var oobject = new OObject(),
				parent = document.createElement("div"),
				child = document.createElement("p");

			oobject.template = child;

			oobject.place(parent);

			expect(oobject.getCurrentPlace()).toBe(parent);
		});

	});

	describe("plugins can add behaviour to your HTML", function () {

		it("has a function for attaching behaviour to the template", function () {
			var plugins = new Plugins(),
				dom = document.createElement("div"),
				template = '<p data-i18n="translate: hello"></p>',
				translationMap = {};

			translationMap["hello"] = "bonjour";

			dom.innerHTML = template;

			plugins.add("i18n", {
				translate: function (dom, key) {
					dom.innerHTML = translationMap[key];
				}
			});

			plugins.apply(dom);

			expect(dom.querySelector("p").innerHTML).toBe("bonjour");
		});

		it("can apply multiple plugins", function () {
			var plugins = new Plugins(),
				dom = document.createElement("div"),
				template = ('<p data-i18n="translate: hello"> </p> ' +
					'<button data-action="listen: click, onClick">Click me</button>'),
				translationMap = {},
				actions = {},
				called = false;

			translationMap["hello"] = "bonjour",
			actions.onClick = function () {
				called = true;
			};

			dom.innerHTML = template;

			plugins.addAll({
				"i18n": {
					translate: function (dom, key) {
						dom.innerHTML = translationMap[key];
					}
				},
				"action": {
					listen: function (dom, event, method) {
						dom.addEventListener(event, actions[method], false);
					}
				}
			});

			plugins.apply(dom);

			expect(dom.querySelector("p").innerHTML).toBe("bonjour");

			dom.querySelector("button").dispatchEvent(CreateMouseEvent("click"));

			expect(called).toBe(true);

		});

		it("can be initialised with a set of plugins", function () {
			var plugin = {},
				plugins = new Plugins({plugin: plugin});

			expect(plugins.get("plugin")).toBe(plugin);
		});

		it("can pass as many arguments to a plugins method as required, and a plugin can have several method", function () {
			var length1,
				length2,
				length3,
				plugin = {
					method1: function (dom, arg1, arg2, arg3) {
						length1 = arguments.length;
					},
					method2: function (dom, arg1, arg2, arg3, arg4) {
						length2 = arguments.length;
					},
					method3: function (dom, arg1, arg2) {
						length3 = arguments.length;
					}
				},
				plugins = new Plugins({plugin: plugin}),
				dom = document.createElement("div"),
				template = '<p data-plugin="method1: arg1, arg2, arg3; method2: arg1, arg2, arg3, arg4; method3: arg1, arg2"></p>';

			dom.innerHTML = template;

			plugins.apply(dom);

			expect(length1).toBe(4);
			expect(length2).toBe(5);
			expect(length3).toBe(3);
		});

	});

});
