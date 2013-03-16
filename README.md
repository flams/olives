##What is Olives?

 * Olives is a JS MVC framework that helps you create realtime UIs.
 * It's a set of AMD/commonJS modules that you can extend with little to no effort.
 * It offers a high level of abstraction that greatly reduces boilerplate.
 * It can seamlessly integrate with graphical libraries.
 * It doesn't require you to learn a custom templating language.
 * It's based on Emily and socket.io to provide a simple and powerful way of communicating with a node.js server.

##What modules does Olives provide?

 * OObject: the spine of your UI.
 * Bind.plugin: a built-in plugin that synchronizes your View with the Model.
 * Event.plugin: make your dom listen to events.
 * LocalStore: A subtype of Emily Store for saving your model into localStorage.
 * SocketIOTransport: connect your UI with a node.js server using socket.io. This is the realtime part of Olives.
 * Place.plugin: compose UIs with multiple UIs.
 * Plugins: extend Olives functionalities with your own plugins.

Olives is based on [Emily](https://github.com/flams/emily)

##How do I install it?

Olives requires an AMD/commonJS compatible loader. I use requirejs: http://requirejs.org/

```html
	<script src="./require.js"></script>
	<script src="./Emily.js"></script>
	<script src="./Olives.js"></script>
```

```js
require(["Module"], function (Module) {
	// Do what you want with Module
});
```

If your application is based on node and you want the realtime part of Olives, on the server side, do:

```bash
npm install requirejs
npm install olives
```

```js
var olives = require("olives");

// Register your instance of socket.io
olives.registerSocketIO(io);
```

##Integration tests:

###OObject

```js
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

});
```


##Live examples

* [The todo application](http://flams.github.com/olives/todo/index.html) Available on [TodoMVC](http://todomvc.com)
* [Ideafy by Taiaut](http://www.taiaut.com/taiaut.com/index.php)
* [Suggestions (Unavailable ATM)]()

## Changelog

####1.3.2 - 15 MAR 2013

* Incorporating 1.3.1 changes, tests + docs clean up
* Updated Emily

####1.3.0 - 17 DEC 2012

 * Olives modules are now anonymous. When downloading Olives you can get its source file and decide by yourself how you want to use them/pack them into your application. A standalone file is still available for rapid prototyping.
 * Model-plugin is now called Bind.plugin
 * Transport is now called SocketIOTransport
 * UI-pugin is now called Place.plugin
 * Plugins are now name as "name.plugin.js" instead of "name-plugin.js"
 * Updated JSDocs



