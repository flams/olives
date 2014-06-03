##What is Olives?

 * Olives is a JS MV* framework that helps you create scalable and realtime UIs.
 * It offers a powerful virtualised and two way data binding tool
 * It has an open API for adding custom features via plugins
 * It declaratively attaches behaviour to an HTML template
 * It's based on [Emily](https://github.com/flams/emily) and socket.io to facilitate the communicaton with server side services on node.js

Olives is part of [TodoMVC.com](http://todomvc.com)

Example of a simplified todo list:

```html
<div class="widget">

	<div>
		<!-- Typing something in the input field will trigger the addTask function -->
		<input type="text" placeholder="What's to be done?" data-event="listen: keydown, addTask">
	</div>

	<div>
		<table>
			<thead>
				<tr>
					<th>#</td>
					<th>Task</th>
					<th>Action</th>
				</tr>
			</thead>

			<!-- The data binding plugin will repeat the following template-->
			<tbody data-bind="foreach">
				<tr>
					<!-- The getId function will be called on this td -->
					<td data-bind="bind: getId">id</td>

					<!-- The innerHTML of this td will be replaced by the value contained in the model
						We will also add a custom plugin that will change the background of this DOM element -->
					<td data-bind="bind: innerHTML" data-custom="color: lightblue">Name</td>

					<!-- Clicking on this will trigger the removeTask function -->
					<td><a href="#" data-event="listen: click, removeTask"><i class="icon-remove"></i></a></td>
				</tr>
			</tbody>
		</table>
	</div>

</div>
```

```js
// OObject is a container for DOM elements
var widget = new OObject();

// List will be our model, it's an array of values
var list = new Store( [] );

// We tell the event plugin where to find the methods to call when en event is triggered
var event = new Event({

	// Add task will add a task in the model
	addTask: function ( event, node ) {
		if ( event.keyCode == 13 ) {
			list.alter( 'push', node.value );
			node.value = '';
		}
	},

	// Remove task will remove it
	removeTask: function ( event, node ) {
		list.del( node.getAttribute('data-bind_id') );
	}
});

// The data binding plugin needs to know where to find the data
var bind = new Bind(list, {

	// Get id can be an extra formatter
	getId: function ( item ) {
		this.innerHTML = list.alter( 'indexOf', item);
	}
});

// I'm adding the plugins to the widget
widget.plugins.addAll({

	// The event plugin will be reachable via data-event attributes
	'event': event,

	// The bind plugin will be reachable via data-bind attributes
	'bind': bind,

	// This is a custom plugin to show how simple it is to extend Olives!
	'custom': {
		color: function ( node, color ) {
			node.style.backgroundColor = color;
		}
	}
});

// Apply the behaviour to the DOM element selected via CSS selector
widget.alive( document.querySelector('.widget') );
```

##How do I install it?

```bash
npm install olives
```

```js
var olives = require("olives");

// Register your instance of socket.io if you want to use socketio-transport.
olives.registerSocketIO(io);
```

##Integration tests:

###OObject

```js
describe("OObject is a container for DOM elements and a starting point for adding it behaviour", function () {

	var OObject = olives.OObject;

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
        var oobject = new OObject(),
            parent = document.createElement("div"),
            child = document.createElement("p");

        oobject.template = child;

        oobject.place(parent);

        expect(oobject.dom).toBe(child);
    });

    it("should throw an error if trying to render or place an oobject without specifying a template", function () {
        var oobject = new OObject();

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
```

###Plugins

```js
describe("plugins can add behaviour to your HTML", function () {

	var Plugins = olives.Plugins;

    it("has a function for attaching behaviour to the template", function () {
        var plugins = new Plugins(),
            dom = document.createElement("div"),
            template = '<p data-i18n="translate: hello"></p>',
            translationMap = {};

        translationMap.hello = "bonjour";

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

        translationMap.hello = "bonjour";

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
```

### Event.plugin

```js
describe("Event plugin can bind event listeners to the DOM", function () {

	var EventPlugin = olives["Event.plugin"];

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
        oobject.template += '<li>Item 1</li>';
        oobject.template += '<li>Item 2</li>';
        oobject.template += '<li>Item 3</li>';
        oobject.template += '<li>Item 4</li>';
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
```

### Bind.plugin

```js
describe("Bind plugin can bind an SVG/HTML template with a Store for two-way binding", function () {

	var BindPlugin = olives["Bind.plugin"];

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
        oobject.template +=     '<li>';
                                    // The className are only useful for querying the dom node for facilitating
                                    // the understanding of the test
        oobject.template +=         '<span class="itemName" data-bind="bind: innerText, name"></span>';
        oobject.template +=         '<span class="itemType" data-bind="bind: innerText, type"></span>';
        oobject.template +=     '</li>';
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
        });

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
```

### Place.plugin

```js
describe("Place.plugin places OObject in the DOM", function () {

	var PlacePlugin = olives["Place.plugin"];

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
```

### LocalStore

```js
describe("LocalStore is an Emily store which can be synchronized with localStorage", function () {

	var LocalStore = olives.LocalStore;

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
```

### SocketIOTransport

Check out documentation [here](https://github.com/cosmosio/socketio-transport)
And see example [here](https://github.com/podefr/socketio-transport-example)

### Stack

```js
describe("Stack for stacking UI element, ordering and hiding/showing them", function () {

	var Stack = olives.Stack;

    it("can stack up UI elements that can be moved around by moving the stack", function () {
        var stack = new Stack();
        var parent1 = document.createElement("div");
        var parent2 =document.createElement("div");
        var UI1 = document.createElement("div");
        var UI2 = document.createElement("div");
        var UI3 = document.createElement("div");

        stack.add(UI1);
        stack.add(UI2);
        stack.add(UI3);

        stack.place(parent1);

        expect(parent1.childNodes[0]).toBe(UI1);
        expect(parent1.childNodes[1]).toBe(UI2);
        expect(parent1.childNodes[2]).toBe(UI3);

        stack.place(parent2);

        expect(parent1.childNodes.length).toBe(0);

        expect(parent2.childNodes[0]).toBe(UI1);
        expect(parent2.childNodes[1]).toBe(UI2);
        expect(parent2.childNodes[2]).toBe(UI3);
    });

    it("can reorder the UI elements in a Stack", function () {
        var stack = new Stack();
        var parent = document.createElement("div");
        var UI1 = document.createElement("span");
        var UI2 = document.createElement("div");
        var UI3 = document.createElement("ul");

        stack.add(UI1);
        stack.add(UI2);
        stack.add(UI3);

        stack.place(parent);

        stack.up(UI2);

        expect(parent.childNodes[0]).toBe(UI1);
        expect(parent.childNodes[1]).toBe(UI3);
        expect(parent.childNodes[2]).toBe(UI2);

        stack.down(UI3);

        expect(parent.childNodes[0]).toBe(UI3);
        expect(parent.childNodes[1]).toBe(UI1);
        expect(parent.childNodes[2]).toBe(UI2);

        stack.move(UI2, 0);

        expect(parent.childNodes[0]).toBe(UI2);
        expect(parent.childNodes[1]).toBe(UI3);
        expect(parent.childNodes[2]).toBe(UI1);

        stack.move(UI2, 1);

        expect(parent.childNodes[0]).toBe(UI3);
        expect(parent.childNodes[1]).toBe(UI2);
        expect(parent.childNodes[2]).toBe(UI1);

        stack.move(UI3, 2);

        expect(parent.childNodes[0]).toBe(UI2);
        expect(parent.childNodes[1]).toBe(UI1);
        expect(parent.childNodes[2]).toBe(UI3);

    });

    it("can directly insert a dom element at a given place", function () {
        var stack = new Stack();
        var parent = document.createElement("div");
        var UI1 = document.createElement("span");
        var UI2 = document.createElement("div");
        var UI3 = document.createElement("ul");

        stack.add(UI1);
        stack.add(UI3);

        stack.place(parent);

        stack.insert(UI2, 1);

        expect(parent.childNodes[0]).toBe(UI1);
        expect(parent.childNodes[1]).toBe(UI2);
        expect(parent.childNodes[2]).toBe(UI3);
    });

    it("can transit between views", function () {
        var stack = new Stack();
        var parent = document.createElement("div");
    	var UI1 = document.createElement("span");
        var UI2 = document.createElement("div");
        var UI3 = document.createElement("ul");

        stack.add(UI1);
        stack.add(UI2);

        stack.place(parent);

        stack.hideAll();

        stack.transit(UI1);

        expect(parent.childNodes[0]).toBe(UI1);

        stack.transit(UI2);

        expect(parent.childNodes[0]).toBe(UI2);
    });
});
```

### LocationRouter

```js
describe("LocationRouter is a router that watches hashmark changes and updates it when the route changes", function () {

	var LocationRouter = olives.LocationRouter;

    it("navigates to the route described by the URL on start", function () {
        var locationRouter = new LocationRouter();
        var spy = jasmine.createSpy();

        locationRouter.set("route", spy);

        window.location.hash = "route/66";

        locationRouter.start();

        expect(spy).toHaveBeenCalledWith("66");
    });

    it("falls back to the route provided by default if no route is specified in the URL", function () {
        var locationRouter = new LocationRouter();
        var spy = jasmine.createSpy();

        locationRouter.set("default", spy);

        window.location.hash = "";

        locationRouter.start("default");

        expect(spy).toHaveBeenCalled();
    });

    it("updates the hashmark when navigating to routes", function () {
        var locationRouter = new LocationRouter();

        locationRouter.set("route", function () {});

        locationRouter.start();

        locationRouter.navigate("route", "66");

        expect(window.location.hash).toBe("#route/66");
    });

    it("allows the parse function to be overridden to determine how hashmarks translates to route params", function () {
        var locationRouter = new LocationRouter(),
            parseResult = [1, 2, 3];

        window.location.hash = "myRoute/and/params/will/be/converted/to/1/2/3";

        spyOn(locationRouter, "navigate");

        locationRouter.parse = jasmine.createSpy().andReturn(parseResult);

        locationRouter.start();

        expect(locationRouter.parse).toHaveBeenCalledWith("#myRoute/and/params/will/be/converted/to/1/2/3");
        expect(locationRouter.navigate.mostRecentCall.args[0]).toBe(1);
        expect(locationRouter.navigate.mostRecentCall.args[1]).toBe(2);
        expect(locationRouter.navigate.mostRecentCall.args[2]).toBe(3);
    });

    it("allows the toUrl function to be overridden to determine how route params translate to hashmark", function () {
        var locationRouter = new LocationRouter();

        locationRouter.toUrl = jasmine.createSpy().andReturn("myRoute/1/2/3");


        locationRouter.onRouteChange("myRoute", 1, 2, 3);

        expect(locationRouter.toUrl.mostRecentCall.args[0]).toEqual(["myRoute", 1, 2, 3]);

        expect(window.location.hash).toBe("#myRoute/1/2/3");
    });

});
```

##Live examples

* [The todo application](http://flams.github.com/olives/todo/index.html) Available on [TodoMVC](http://todomvc.com)
* [Ideafy by Taiaut](http://www.taiaut.com/taiaut.com/index.php)
* [Eyeswitch](http://eyeswitch.com)

## Changelog

###3.0.5 - 02 JUNE 2014

* Clean up

###3.0.4 - 02 JUNE 2014

* Fix issue preventing Olives from loading on the server side in Event-plugin

###3.0.3 - 02 JUNE 2014

* Fix issue preventing Olives from loading on the server side

####3.0.1 - 28 APR 2014

* Doc update.

####3.0.0 - 28 APR 2014

* Remove each library's implementation and use npm modules instead. Backward compatible appart from DomUtils which has been removed.
* The browserified version isn't built anymore, it'll have to be done as part of the package of the final app.

####2.0.0 - 26 FEB 2014

* The OObject doesn't create or hold a reference to a Store by default.

####2.0.0 beta - 04 FEB 2014

* Remove dependency on require.js

####1.6.0 - 07 SEP 2013

* Fix a bug in locationRouter causing a route to be called two times
* locationRouter can start at a default route
* Stack can also transit between two views by showing the new one and hiding the previously displayed

####1.5.2 - 04 SEP 2013

* Fix a bug in LocationRouter that caused the URL not to be updated while navigating

####1.5.1 - 03 SEP 2013

* Fix a bug in stack preventing a hidden element to be displayed back at its original place
* Fix a bug in LocationRouter that caused the URL not to be updated while navigating
* LocationRouter clears the previous history on start

####1.5.0 - 04 AUG 2013

* Add Stack for stacking up UI elements, ordering, showing and hiding them by taking them out of the DOM. The preferred way for managing what should be displayed on the screen while caring about the performance of your app.
* Add Location Router based on Emily's Router for managing routes based on the URL's hashmark.
* Add "use strict" statements

####1.4.2 - 10 JUNE 2013

* Fixed performance and memory issues with data-binding's item renderer when using virtualised grid. Check a 1,000,000 rows Grid using Olives data-binding: http://podefr.github.io/olives-virtualised-grid/

####1.4.1 - 13 MAY 2013

* Improved virtualisation performances in the data binding plugin when used with large data sets (>100,000 items)

####1.4.0 - 24 MAR 2013

* Added Bind.plugin.getItemIndex for getting the index of a foreach generated item in a store
* Plugins constructor can be called with the list of plugins
* Updated all documentations
* SocketIOTransport doesn't initialise the socket anymore, the socket must be given

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
