/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["OObject", "Plugins", "Event.plugin", "Bind.plugin", "Store"],

function(OObject, Plugins, EventPlugin, BindPlugin, Store) {

	function CreateMouseEvent(type) {
		var event = document.createEvent("MouseEvents");
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

	describe("Event plugin can bind event listeners to the DOM", function () {

		it("has a method for adding an event listener to a dom element", function () {
			var oobject = new OObject(),
				// The event plugin must be given an object
				// so it knows where to find the methods to call
				eventPlugin = new EventPlugin(oobject),
				called = false,
				thisObject;

			// Here we tell the event plugin to listen for the click event
			// And that when it occurs, it should call onClick
			// The last parameter tells the phase we want to listen to (propagation == true, bubbling == false)
			oobject.template = '<button data-event="listen: click, onClick, true"></button>';

			// The function that will be called when the dom node is clicked
			oobject.onClick = function () {
				called = true;
				thisObject = this;
			};

			// Add the event plugin to the oobject
			oobject.plugins.add("event", eventPlugin);

			oobject.render();

			oobject.dom.dispatchEvent(CreateMouseEvent("click"));

			expect(called).toBe(true);
			expect(thisObject).toBe(oobject);

		});

		xit("can delegate an event for a set of DOM elements to the parent DOM", function () {
			var oobject = new OObject(),
				// The event plugin must be given an object
				// so it knows where to find the methods to call
				eventPlugin = new EventPlugin(oobject),
				clickedNode,
				clickEvent = CreateMouseEvent("click");

			// Here we tell the event plugin to listen for the click event
			// And that when it occurs, it should call onClick
			// The last parameter tells the phase we want to listen to (propagation == true, bubbling == false)
			oobject.template = '<ul data-event="delegate: li, click, onClick, true">';
			oobject.template +=	'<li>Item 1</li>';
			oobject.template +=	'<li>Item 2</li>';
			oobject.template +=	'<li>Item 3</li>';
			oobject.template +=	'<li>Item 4</li>';
			oobject.template += '</ul>';

			// The function that will be called when the dom node is clicked
			oobject.onClick = function (event, node) {
				clickedNode = node;
			};

			// Add the event plugin to the oobject
			oobject.plugins.add("event", eventPlugin);

			oobject.render();


			clickEvent.target = oobject.dom.querySelectorAll("li")[3];
			oobject.dom.dispatchEvent(clickEvent);

			expect(clickedNode.innerText).toBe("Item 4");
		});

	});

	describe("Bind plugin can bind an SVG/HTML template with a Store for two-way binding", function () {

		it("sets the property of a DOM element to the value set in the store, for a given key", function () {
			var oobject = new OObject(),
				store = new Store(),
				bindPlugin = new BindPlugin(store);

			oobject.template = '<p data-bind="bind: innerText, name"></p>';

			oobject.plugins.add("bind", bindPlugin);

			oobject.render();

			store.set("name", "Olives");

			expect(oobject.dom.innerText).toBe("Olives");

			store.set("name", "Emily");

			expect(oobject.dom.innerText).toBe("Emily");
		});

		it("can work with any dom property", function () {

		});

	})

});