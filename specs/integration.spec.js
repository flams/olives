/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["OObject", "Plugins", "Event.plugin", "Bind.plugin", "Store", "DomUtils", "Place.plugin", "LocalStore"],

function(OObject, Plugins, EventPlugin, BindPlugin, Store, DomUtils, PlacePlugin, LocalStore) {

	function CreateMouseEvent(type) {
		var event = document.createEvent("MouseEvents");
		event.initEvent(type, true, true);
		return event;
	}

	function hasItem(array, item) {
		return array.indexOf(item) >= 0;
	}

	function toArray(list) {
		return [].slice.call(list, 0);
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
			var oobject = new OObject(),
				store = new Store(),
				bindPlugin = new BindPlugin(store);

			oobject.template = '<p data-bind="bind: className, level"></p>';

			oobject.plugins.add("bind", bindPlugin);

			oobject.render();

			store.set("level", "info");

			expect(oobject.dom.className).toBe("info");

			store.set("level", "warning");

			expect(oobject.dom.className).toBe("warning");
		});

		it("can create a new template for each item in a store", function () {
			var oobject = new OObject(),
				store = new Store([]),
				bindPlugin = new BindPlugin(store);

			oobject.template = '<ul data-bind="foreach">';
			oobject.template += '<li data-bind="bind: innerText"></li>';
			oobject.template += '</ul>';

			oobject.plugins.add("bind", bindPlugin);

			oobject.render();

			store.alter("push", "Olives");

			expect(oobject.dom.childNodes.length).toBe(1);
			expect(oobject.dom.querySelectorAll("li")[0].innerText).toBe("Olives");

			store.alter("push", "Emily");

			expect(oobject.dom.childNodes.length).toBe(2);
			expect(oobject.dom.querySelectorAll("li")[1].innerText).toBe("Emily");

			store.alter("shift");

			expect(oobject.dom.childNodes.length).toBe(1);
			expect(oobject.dom.querySelectorAll("li")[0].innerText).toBe("Emily");
		});

		it("can create a new template for more complex items in a store, like an object", function () {
			var oobject = new OObject(),
				store = new Store([]),
				bindPlugin = new BindPlugin(store);


			oobject.template = '<ul data-bind="foreach">';
			oobject.template += 	'<li>';
										// The className are only useful for querying the dom node for facilitating
										// the understanding of the test
			oobject.template += 		'<span class="itemName" data-bind="bind: innerText, name"></span>';
			oobject.template += 		'<span class="itemType" data-bind="bind: innerText, type"></span>';
			oobject.template += 	'</li>';
			oobject.template += '</ul>';

			oobject.plugins.add("bind", bindPlugin);

			oobject.render();

			store.alter("push", {
				name: "Olives",
				type: "MVC"
			});

			expect(oobject.dom.childNodes.length).toBe(1);
			expect(oobject.dom.querySelectorAll("li .itemName")[0].innerText).toBe("Olives");
			expect(oobject.dom.querySelectorAll("li .itemType")[0].innerText).toBe("MVC");

			store.alter("push", {
				name: "Emily",
				type: "Library"
			})

			expect(oobject.dom.childNodes.length).toBe(2);
			expect(oobject.dom.querySelectorAll("li .itemName")[1].innerText).toBe("Emily");
			expect(oobject.dom.querySelectorAll("li .itemType")[1].innerText).toBe("Library");

			store.alter("shift");

			expect(oobject.dom.childNodes.length).toBe(1);
			expect(oobject.dom.querySelectorAll("li .itemName")[0].innerText).toBe("Emily");

		});

		it("can tell the id of an item in the store", function () {
			var oobject = new OObject(),
				store = new Store([]),
				bindPlugin = new BindPlugin(store);

			oobject.template = '<ul data-bind="foreach">';
			oobject.template += '<li data-bind="bind: innerText, name"></li>';
			oobject.template += '</ul>';

			oobject.plugins.add("bind", bindPlugin);

			oobject.render();

			store.alter("push", {
				name: "Olives"
			});

			store.alter("push", {
				name: "Emily"
			});

			expect(bindPlugin.getItemIndex(oobject.dom.querySelectorAll("li")[0])).toBe(0);
			expect(bindPlugin.getItemIndex(oobject.dom.querySelectorAll("li")[1])).toBe(1);
		});

	});

	describe("DomUtils is a collection of tools for manipulating the dom", function () {

		it("has a function for getting an element's dataset even if the browser doesn't support the property", function () {

			var dom = document.createElement("div");

			dom.innerHTML = '<p data-name="Olives"></p>';

			dataset = DomUtils.getDataset(dom.querySelector("p"));

			expect(dataset.name).toBe("Olives");

		});

		it("has a function for setting the attribute of both an HTML and an SVG element", function () {
			var htmlElement = document.createElement("p"),
				svgElement = svgElement = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");

			DomUtils.setAttribute(svgElement, "width", 100);

			expect(svgElement.getAttribute("width")).toBe('100');

			DomUtils.setAttribute(htmlElement, "innerText", "Olives");

			expect(htmlElement.innerText).toBe("Olives");
		});

		it("has a function for getting a DOM node and its siblings", function () {

			var parent = document.createElement("div"),
				sibling1 = document.createElement("p"),
				sibling2 = document.createElement("p"),
				sibling3 = document.createElement("p"),
				child1 = document.createElement("span"),
				child2 = document.createElement("span"),
				child3 = document.createElement("span");

			parent.appendChild(sibling1);
			parent.appendChild(sibling2);
			parent.appendChild(sibling3);

			sibling1.appendChild(child1);
			sibling2.appendChild(child2);
			sibling3.appendChild(child3);

			var list = toArray(DomUtils.getNodes(sibling2));

			expect(hasItem(list, sibling1)).toBe(true);
			expect(hasItem(list, sibling2)).toBe(true);
			expect(hasItem(list, sibling3)).toBe(true);
			expect(hasItem(list, child1)).toBe(true);
			expect(hasItem(list, child2)).toBe(true);
			expect(hasItem(list, child3)).toBe(true);

		});

		it("can restrict the returns DOM elements to a given CSS selector", function () {
			var parent = document.createElement("div"),
				sibling1 = document.createElement("p"),
				sibling2 = document.createElement("p"),
				sibling3 = document.createElement("p"),
				child1 = document.createElement("span"),
				child2 = document.createElement("span"),
				child3 = document.createElement("span");

			parent.appendChild(sibling1);
			parent.appendChild(sibling2);
			parent.appendChild(sibling3);

			sibling1.appendChild(child1);
			sibling2.appendChild(child2);
			sibling3.appendChild(child3);

			var list = toArray(DomUtils.getNodes(sibling2, "span"));

			expect(hasItem(list, sibling1)).toBe(false);
			expect(hasItem(list, sibling2)).toBe(false);
			expect(hasItem(list, sibling3)).toBe(false);
			expect(hasItem(list, child1)).toBe(true);
			expect(hasItem(list, child2)).toBe(true);
			expect(hasItem(list, child3)).toBe(true);
		});

		it("has a function for telling if an a child node matches a given CSS selector", function () {

			var parent = document.createElement("div"),
				child = document.createElement("p");

			parent.appendChild(child);

			expect(DomUtils.matches(parent, "p", child)).toBe(true);
			expect(DomUtils.matches(parent, "ul", child)).toBe(false);
			expect(DomUtils.matches(parent, "p.text", child)).toBe(false);

		});

	});

	describe("Place.plugin places OObject in the DOM", function () {

		it("has a function for adding adding an oobject", function () {
			var parentUI = new OObject(),
				childUI = new OObject(),
				placePlugin = new PlacePlugin();

			childUI.template = '<p></p>';

			parentUI.template = '<div data-place="place: myUI"></div>';

			parentUI.plugins.add("place", placePlugin);

			placePlugin.set("myUI", childUI);

			parentUI.render();

			expect(parentUI.dom.childNodes[0]).toBe(childUI.dom);
		});

		it("has a function for adding multiple oobjects, equivalent to calling set multiple times", function () {
			var parentUI = new OObject(),
				childUI1 = new OObject(),
				childUI2 = new OObject(),
				placePlugin = new PlacePlugin();

			childUI1.template = '<p></p>';
			childUI2.template = '<p></p>';

			parentUI.template = '<ul>';
			parentUI.template += '<li data-place="place: myUI1"></li>';
			parentUI.template += '<li data-place="place: myUI2"></li>';
			parentUI.template += '</ul>';

			parentUI.plugins.add("place", placePlugin);

			placePlugin.setAll({
				"myUI1": childUI1,
				"myUI2": childUI2
			});

			parentUI.render();

			expect(parentUI.dom.querySelectorAll("p")[0]).toBe(childUI1.dom);
			expect(parentUI.dom.querySelectorAll("p")[1]).toBe(childUI2.dom);
		});

	});

	describe("LocalStore is an Emily store which can be synchronized with localStorage", function () {

		it("can be initialised like an Emily Store", function () {
			var store = new LocalStore({
				name: "Olives",
				type: "MVC"
			});

			expect(store.get("type")).toBe("MVC");
		});

		it("can be synchronized with localStorage", function () {
			var store = new LocalStore({
				name: "Olives",
				type: "MVC"
			});

			// the store is now persisted in localStorage
			store.sync("OlivesStore");
		});

		it("can reload data from localStorage", function () {
			var store = new LocalStore();

			store.sync("OlivesStore");

			expect(store.get("name")).toBe("Olives");
		});

	});

	describe("SocketIOTransport wraps socket.io to issue requests and listen to Olives channels from a node.js server", function () {

		xit("[SERVER SIDE] has a function for adding an Olives handler", function () {
			var olives = require("olives");

			// socket is the socket created by socket.io, listening to the web server
			olives.registerSocketIO(socket);

			olives.handlers.set("myHandler", function (payload, onEnd, onData) {

				// payload comes from the client and holds data needed to issue the request
				// It can be of any type

				// Call onEnd when you want to send something to the client that will close the connection
				onEnd(data);

				// Call onData if it's a chunk and that more are coming, so the connection stays alive
				onData(data);

			});
		});

		xit("can issue a request to a handler on the server side", function () {
			var transport = new SocketIOTransport(fakeSocket);

			// The payload can be any type, or a JSON
			var payload = {};

			transport.request("myHandler", payload, function callback(data) {
				// Do what you want with data
			});
		});

		xit("can listen to a kept-alive socket", function () {
			var transport = new SocketIOTransport(fakeSocket);

			// The payload can be any type, or a JSON
			var payload = {};

			var stop = transport.listen("myHandler", payload, function callback(data) {
				// Do what you want with data
			});

			// Stop can be called whenever the listener is no more interested by the channel's updates
			stop();
		});

	});

});
