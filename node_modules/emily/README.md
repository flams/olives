##What is Emily?

 * Emily is a JS library for building scalable web applications.
 * It's runtime agnostic as it doesn't rely on the DOM.
 * It's ready for realtime applications.
 * It's only a set of AMD/commonJS modules, your module loader is the framework
 * It's ready for being used with other frameworks.
 * It only relies on standard features
 * It eases the development of MV* applications by providing the M

##What modules does it provide?

 * Observable: the all mighty observer design pattern.
 * Store: the spine of your MV* application.
 * Promise: a fully compliant promise/A+ implementation following [promiseA+-tests](https://github.com/promises-aplus/promises-tests)
 * StateMachine: don't hide your states and transitions behind if/else anymore.
 * Transport: make requests to anything node.js has access to.
 * Tools: these functions you always need and rewrite.
 * Router: set routes with associated actions and navigate to them while keeping tack of the history

##How do I use it?

####In the browser:

Emily requires an AMD/commonJS compatible loader. I use requirejs: [require.js](http://requirejs.org/)
Download the latest version of [Emily here](http://flams.github.com/emily/)

```html
	<script src="require.js"></script>
	<script src="Emily.js"></script>
```

```js
	require(["Module"], function (Module) {
		// Do what you want with Module
	});
```

####In node:

```
npm install requirejs emily
```

```js
	var requirejs = require("requirejs");
		emily = require("emily");

	requirejs(["Module"], function (Module) {
		// Do what you want with Module
	});
```

##Integration tests:

###Observable

```js
describe("Observable implements the Observer design pattern, also called publish subscribe", function () {

	it("has a notify function for publishing something on a topic", function () {
		var observable = new Observable(),
			scope = null,
			expectedScope = {},
			message;

		observable.watch("topic", function listener(something) {
			message = something;
			scope = this;
		}, expectedScope);

		observable.notify("topic", "hello");

		expect(message).toBe("hello");

		expect(expectedScope).toBe(scope);
	});

	it("can listen to events on a topic only once", function () {
		var observable = new Observable(),
			listener = jasmine.createSpy(),
			handle = null;

		handle = observable.once("topic", listener, this);

		expect(observable.hasObserver(handle)).toBe(true);

		observable.notify("topic", 1, 2, 3);

		expect(listener).toHaveBeenCalledWith(1, 2, 3);

		listener.reset();

		expect(observable.hasObserver(handle)).toBe(false);

		observable.notify("topic", 1, 2, 3);

		expect(listener).not.toHaveBeenCalled();
	});

	it("notifies several listeners in the order they were added", function () {
		var observable = new Observable(),
			order = [];

		observable.watch("topic", function listener1() {  order.push(1); });
		observable.watch("topic", function listener2() {  order.push(2); });
		observable.watch("topic", function listener3() {  order.push(3); });

		observable.notify("topic");

		expect(order[0]).toBe(1);
		expect(order[1]).toBe(2);
		expect(order[2]).toBe(3);
	});

	it("should continue publishing on all the listeners even if one of them fails", function () {
		var observable = new Observable(),
			order = [];

		observable.watch("topic", function listener1() {  order.push(1); });
		observable.watch("topic", function listener2() {  throw new Error("this listener fails"); });
		observable.watch("topic", function listener3() {  order.push(3); });

		observable.notify("topic");

		expect(order[0]).toBe(1);
		expect(order[1]).toBe(3);
	});

	it("can bind the this object of a listener to a given object and pass multiple things on the topic", function () {
		var observable = new Observable(),
			message1,
			message2,
			message3,
			context;

		observable.watch("topic", function listener(something1, something2, something3) {
			message1 = something1;
			message2 = something2;
			message3 = something3;
			context = this;
		}, this);

		observable.notify("topic", "hello", "this is", "emily");

		expect(message1).toBe("hello");
		expect(message2).toBe("this is");
		expect(message3).toBe("emily");
		expect(context).toBe(this);
	});

	it("can remove a listener from a topic", function () {
		var observable = new Observable(),
			removed = true;

		var handle = observable.watch("topic", function listener(something) {
			removed = false;
		});

		// Remove the listener so it doesn't get called anymore
		observable.unwatch(handle);

		observable.notify("topic");

		expect(removed).toBe(true);
	});

	it("can remove all listeners from a given topic", function () {
		var observable = new Observable(),
			topics = [];

		observable.watch("topic1", function listener1() { topics.push("topic1"); });
		observable.watch("topic1", function listener2() { topics.push("topic1"); });
		observable.watch("topic2", function listener3() { topics.push("topic2"); });

		observable.unwatchAll("topic1");

		observable.notify("topic1");
		observable.notify("topic2");

		expect(topics.length).toBe(1);
		expect(topics[0]).toBe("topic2");
	});

	it("can remove all listeners", function () {
		var observable = new Observable(),
			topics = [];

		observable.watch("topic1", function listener1() { topics.push("topic1"); });
		observable.watch("topic1", function listener2() { topics.push("topic1"); });
		observable.watch("topic2", function listener3() { topics.push("topic2"); });

		observable.unwatchAll();

		observable.notify("topic1");
		observable.notify("topic2");

		expect(topics.length).toBe(0);
	});

});
```

###Tools

```js
describe("Tools is a set of tools commonly used in JavaScript applications", function () {

	describe("Tools.getGlobal can retrieve the global object", function () {

		it("returns the global object", function () {
			expect(Tools.getGlobal()).toBe(__Global);
		});
	});

	describe("Tools.mixin can add an object's properties to another object", function () {

		it("takes the properties of the second object to mix them into the first one", function () {
			var source = {c: 30, d: 40},
				destination = {a: 10, b: 20};

			Tools.mixin(source, destination);

			expect(destination.a).toBe(10);
			expect(destination.b).toBe(20);
			expect(destination.c).toBe(30);
			expect(destination.d).toBe(40);
		});

		it("overrides the destination's values with the source ones by default", function () {
			var source = {c: 30, d: 40},
				destination = {a: 10, b: 20, c: 25};

			Tools.mixin(source, destination);

			// The destination's c has been replaced by the source's one
			expect(destination.c).toBe(30);
		});

		it("can prevent the desitnation's values to be replaced", function () {
			var source = {c: 30, d: 40},
				destination = {a: 10, b: 20, c: 25};

			Tools.mixin(source, destination, true);

			// The destination's c has been replaced by the source's one
			expect(destination.c).toBe(25);
		});

		it("also returns the destination object", function () {
			var source = {c: 30, d: 40},
				destination = {a: 10, b: 20, c: 25};

			expect(Tools.mixin(source, destination, true)).toBe(destination);
		});
	});

	describe("Tools.count tells how many own properties an Object has", function () {

		it("only counts own properties", function () {
			var object = {a: 10, b: 20};

			expect(Tools.count(object)).toBe(2);
		});

	});

	describe("Tools.compareObject tells if two objects have the same properties, useful for duck typing", function () {

		it("tells if two objects have the same properties", function () {
			var o1 = {a: 1, c:3, b:4, x:10},
				o2 = {a: 2, b:52, c:4, x:100},
				o3 = {a: 5, b: 3, x: 50};

			expect(Tools.compareObjects(o1, o2)).toBe(true);
			expect(Tools.compareObjects(o2, o3)).toBe(false);
		});

	});

	describe("Tools.compareNumbers is useful for telling if a number if greater, equal or lower than another one", function () {

		it("tells if a number is greater than another one", function () {
			expect(Tools.compareNumbers(2.3, 2.2)).toBe(1);
		});

		it("tells if a number equals another one", function () {
			expect(Tools.compareNumbers(2.2, 2.2)).toBe(0);
		});

		it("tells if a number is lower than another one", function () {
			expect(Tools.compareNumbers(2.1, 2.2)).toBe(-1);
		});

		it("can ASC sort numbers when using Array.sort", function () {
			var array = [0, 2, 9, 4, 1, 7, 3, 12, 11, 5, 6, 8, 10];

			array.sort(Tools.compareNumbers);

			expect(array[10]).toBe(10);
			expect(array[11]).toBe(11);
		});

	});

	describe("Tools.toArray transforms an array like object, like arguments or a nodeList to an actual array", function () {

		it("transforms a list of arguments to an array", function () {
			(function () {
				var args = Tools.toArray(arguments);

				expect(Array.isArray(args)).toBe(true);

			})();
		});

		it("transforms a nodelist into an array", function () {
			if (__Global.document) {
				var all = Tools.toArray(document.querySelectorAll("*"));

				expect(Array.isArray(all)).toBe(true);
			}
		});
	});

	describe("Tools.loop abstracts the difference between iterating over an object and an array", function () {

		it("can iterate over an array", function () {
			var array = [0, 1, 2, 3];

			var _self = this;

			Tools.loop(array, function (value, index, iterated) {
				expect(iterated).toBe(array);
				expect(array[index]).toBe(value);
				// The context in which to run this function can also be given
				expect(this).toBe(_self);
			}, this);
		});

		it("can iterate over an array which length varies", function () {
			var iterated = [1],
				nbOfCalls = 0;

			Tools.loop(iterated, function (value) {
				if (nbOfCalls < 10) {
					iterated.push(1);
					nbOfCalls++;
				}
			});

			expect(iterated.length).toBe(11);
		});

		it("can iterate over an object", function () {
			var object = {a: 10, b: 20};

			Tools.loop(object, function (value, key, obj) {
				expect(object).toBe(obj);
				expect(object[key]).toBe(value);
			});
		});
	});

	describe("Tools.objectsDiffs returns an object describing the differences between two objects", function () {

		it("tells what was added in an array", function () {
			var array1 = ["a", "b", "c"],
				array2 = ["a", "b", "c", "d", "e"];

			var diff = Tools.objectsDiffs(array1, array2);
			// The third item of array2 was added
			expect(diff.added[0]).toBe(3);
			// The fourth item too
			expect(diff.added[1]).toBe(4);
		});

		it("tells what was removed", function () {
			var array1 = ["a", "b", "c"],
				array2 = ["a", "b"];

			var diff = Tools.objectsDiffs(array1, array2);
			// The third item of array2 was deleted
			expect(diff.deleted[0]).toBe(2);
		});

		it("tells what was updated", function () {
			var array1 = ["a", "b", "c"],
				array2 = ["a", "d", "e"];

			var diff = Tools.objectsDiffs(array1, array2);
			// The second item of array2 was updated
			expect(diff.updated[0]).toBe(1);
			// The third one too
			expect(diff.updated[1]).toBe(2);
		});

		it("tells what remains unchanged", function () {
			var array1 = ["a", "b", "c"],
				array2 = ["a", "d", "e"];

			var diff = Tools.objectsDiffs(array1, array2);
			// The first item remains unchanged
			expect(diff.unchanged[0]).toBe(0);
		});

		it("also works with objects", function () {
			var object1 = { a: 10, b: 20, c: 30},
				object2 = { b: 30, c: 30, d: 40};

			var diff = Tools.objectsDiffs(object1, object2);

			expect(diff.deleted[0]).toBe("a");
			expect(diff.updated[0]).toBe("b");
			expect(diff.unchanged[0]).toBe("c");
			expect(diff.added[0]).toBe("d");
		});

	});

	describe("Tools.jsonify returns the jsonified version of an object", function () {

		it("returns a new object without the properties that can't be saved in a stringified json", function () {
			var nonJsonObject = {
				a: function () {},
				b: undefined,
				c:["emily"]
			};

			var jsonified = Tools.jsonify(nonJsonObject);

			expect(Tools.count(jsonified)).toBe(1);
			expect(jsonified.c[0]).toBe("emily");
			expect(jsonified.c).not.toBe(nonJsonObject.c);
		});

	});

	describe("Tools.setNestedProperty sets the property of an object nested in one or more objects", function () {

		it("sets the property of an object deeply nested and creates the missing ones", function () {
			var object = {};

			Tools.setNestedProperty(object, "a.b.c.d.e.f", "emily");

			expect(object.a.b.c.d.e.f).toBe("emily");
		});

		it("returns the value if the first parameter is not an object", function () {
			expect(Tools.setNestedProperty("emily")).toBe("emily");
		});

		it("also works if there are arrays in the path, but it doesn't create an array", function () {
			var object = {};

			Tools.setNestedProperty(object, "a.b.c.0.d", "emily");

			expect(object.a.b.c[0].d).toBe("emily");
			expect(Array.isArray(object.a.b.c)).toBe(false);
		});

	});

	describe("Tools.getNestedProperty gets the property of an object nested in other objects", function () {

		it("gets the property of an object deeply nested in another one", function () {
			var object = {b:{c:{d:{e:1}}}};

			expect(Tools.getNestedProperty(object, "b.c")).toBe(object.b.c);
			expect(Tools.getNestedProperty(object, "b.c.d.e")).toBe(1);
		});

		it("also works if an array is in the path", function () {
			var object = {a: [{b: 1}]};

			expect(Tools.getNestedProperty(object, "a.0.b")).toBe(1);
		});

	});

	describe("Tools.closest finds the closest number to a base number in an array and returns its index", function () {

		it("gets the closest number", function () {
			expect(Tools.closest(10, [30, 5, 40, 20])).toBe(1);
			expect(Tools.closest(25, [30, 5, 40, 20])).toBe(0);
			expect(Tools.closest(30, [30, 5, 40, 20])).toBe(0);
			expect(Tools.closest(45, [30, 5, 40, 20])).toBe(2);
		});

		it("gets the closest number that is greater", function () {
			expect(Tools.closestGreater(10, [30, 5, 40, 20])).toBe(3);
			expect(Tools.closestGreater(25, [30, 5, 40, 20])).toBe(0);
			expect(Tools.closestGreater(30, [30, 5, 40, 20])).toBe(0);
			expect(Tools.closestGreater(45, [30, 5, 40, 20])).toBeUndefined();
		});

		it("gets the closest number that is lower", function () {
			expect(Tools.closestLower(10, [30, 5, 40, 20])).toBe(1);
			expect(Tools.closestLower(25, [30, 5, 40, 20])).toBe(3);
			expect(Tools.closestLower(30, [30, 5, 40, 20])).toBe(0);
			expect(Tools.closestLower(45, [30, 5, 40, 20])).toBe(2);
		});

	});

});
```

### Store

```js
describe("Store is an observable data structure that publishes events whenever it's updated", function () {

	it("can store its data in an object", function () {
		var store = new Store({});

		store.set("key", "emily");
		store.set("otherKey", 2);

		expect(store.get("key")).toBe("emily");
		expect(store.get("otherKey")).toBe(2);

		expect(store.has("key")).toBe(true);

		expect(store.del("key")).toBe(true);
		expect(store.del("key")).toBe(false);
		expect(store.has("key")).toBe(false);
	});

	it("can store data in an array", function () {
		var store = new Store([]);

		store.set(0, "emily");
		store.set(1, 1);

		expect(store.get(0)).toBe("emily");
		expect(store.get(1)).toBe(1);

		expect(store.del(0)).toBe(true);
		expect(store.get(0)).toBe(1);
	});

	it("can be initialized with data", function () {
		var store = new Store({a: 10});

		expect(store.get("a")).toBe(10);
	});

	it("can be initialized two times with the same data but the data are not shared between them", function () {
		var data = {a: 10},
			store1 = new Store(data),
			store2 = new Store(data);

		store1.set("b", 20);

		expect(store2.has("b")).toBe(false);
	});

	it("publishes events when a store is updated", function () {
		var store = new Store([]),
			itemAdded = false,
			itemUpdated = false,
			itemDeleted = false,
			handle;

		// Listening to the events uses the same API as the Observable
		handle = store.watch("added", function (key) {
			itemAdded = key;
		}, this);

		store.watch("updated", function (key) {
			itemUpdated = key;
		}, this);

		store.watch("deleted", function (key) {
			itemDeleted = key;
		}, this);

		store.set(0, "emily");

		expect(itemAdded).toBe(0);

		store.set(0, "olives");

		expect(itemUpdated).toBe(0);

		store.del(0);

		expect(itemDeleted).toBe(0);

		store.unwatch(handle);
	});

	it("publishes events when a value in the store is updated", function () {
		var store = new Store([]),
			spyNewValue,
			spyOldValue,
			spyEvent,
			handle;

		handle = store.watchValue(0, function (newValue, action, oldValue) {
			spyNewValue = newValue;
			spyOldValue = oldValue;
			spyEvent = action;
		}, this);

		store.set(0, "emily");

		expect(spyNewValue).toBe("emily");
		expect(spyEvent).toBe("added");

		store.set(0, "olives");

		expect(spyNewValue).toBe("olives");
		expect(spyEvent).toBe("updated");
		expect(spyOldValue).toBe("emily");

		store.unwatchValue(handle);
	});

	it("works the same with objects", function () {
		var store = new Store({}),
			spyNewValue,
			spyOldValue,
			spyEvent;

		store.watchValue("key", function (newValue, action, oldValue) {
			spyNewValue = newValue;
			spyOldValue = oldValue;
			spyEvent = action;
		}, this);

		store.set("key", "emily");

		expect(spyNewValue).toBe("emily");
		expect(spyEvent).toBe("added");

		store.set("key", "olives");

		expect(spyNewValue).toBe("olives");
		expect(spyEvent).toBe("updated");
		expect(spyOldValue).toBe("emily");
	});

	it("can update the property of an object nested in a store and publish an event", function () {
		var store = new Store({
				key: {}
			}),
			updatedValue = false;

		store.watchValue("key", function (value) {
			updatedValue = value;
		}, this);

		store.update("key", "a.b.c", "emily");

		expect(updatedValue.a.b.c).toBe("emily");

	});

	it("can delete multiple items in one function call", function () {
		var store = new Store(["a", "b", "c", "d", "e", "f"]);

		store.delAll([0,1,2]);

		expect(store.count()).toBe(3);

		expect(store.get(0)).toBe("d");
		expect(store.get(1)).toBe("e");
		expect(store.get(2)).toBe("f");
	});

	it("can delete multiple properties in one function call", function () {
		var store = new Store({a: 10, b: 20, c: 30});

		store.delAll(["a", "b"]);

		expect(store.count()).toBe(1);

		expect(store.has("a")).toBe(false);
		expect(store.has("b")).toBe(false);
		expect(store.has("c")).toBe(true);
	});

	it("can compute properties from other properties", function () {
		var store = new Store({a: 1000, b: 336}),
			observedComputed;

		store.compute("c", ["a", "b"], function () {
			return this.get("a") + this.get("b");
		}, store);

		expect(store.get("c")).toBe(1336);

		store.watchValue("c", function (value) {
			observedComputed = value;
		});

		store.set("b", 337);

		expect(store.get("c")).toBe(1337);
		expect(observedComputed).toBe(1337);
	});

	it("can alter the inner data structure and publish changes when it's an array", function () {
		var store = new Store([0, 2, 3]),
			newValue;

		store.watchValue(1, function (value) {
			newValue = value;
		});
		// Splice can alter the store
		store.alter("splice", 1, 0, 1); // [0,1,2,3]

		expect(store.get(1)).toBe(1);
		expect(newValue).toBe(1);

		// Map doesn't alter it, just like calling map on any array
		var newArray = store.alter("map", function (value) {
			return value * 2;
		});

		expect(newArray[3]).toBe(6);
	});

	it("can also alter the inner structure and publish changes when it's an object", function () {
		var store = new Store({a: 10});

		expect(store.alter("hasOwnProperty", "a")).toBe(true);
	});

	it("can also directly call the methods of the inner structure without further publishing events", function () {
		var store = new Store([0, 1, 2]);

		expect(store.proxy("slice", 1, 2)).toEqual([1]);
	});

	it("has a function for iterating over it the same way being based on an object or an array", function () {
		var store = new Store({a: 10, b: 20}),
			calls = [];

		store.loop(function () {
			calls.push(arguments);
		});

		// Note that it's lucky that this test passes
		// as loop doesn't guarantee the order in case of an object!
		expect(calls[0][0]).toBe(10);
		expect(calls[0][1]).toBe("a");

		expect(calls[1][0]).toBe(20);
		expect(calls[1][1]).toBe("b");

		store = new Store(["a", "b"]);
		calls = [];

		store.loop(function () {
			calls.push(arguments);
		});

		expect(calls[0][0]).toBe("a");
		expect(calls[0][1]).toBe(0);

		expect(calls[1][0]).toBe("b");
		expect(calls[1][1]).toBe(1);
	});

	it("has a function for resetting the whole store", function () {
		var store = new Store({a: 10}),
			itemAdded;

		// Calling reset fires the diff events
		store.watch("added", function (key) {
			itemAdded = key;
		});

		store.reset(["a"]);

		expect(store.get(0)).toBe("a");

		expect(itemAdded).toBe(0);
	});

	it("can return the jsonified version of itself", function () {
		var store = new Store({a: undefined}),
			jsonified;

		expect(store.has("a")).toBe(true);

		jsonified = store.toJSON();
		expect(Tools.count(jsonified)).toBe(0);
	});

	it("can return it's internal structure", function () {
		var store = new Store({a: 10}),
			internal;

		internal = store.dump();

		expect(internal.a).toBe(10);

		// The internal is not the object passed at init
		expect(store).not.toBe(internal);

	});

});
```

### Promise

```js
describe("Promise is a fully Promise/A+ compliant implementation", function () {

	it("calls the fulfillment callback within scope", function () {
		var promise = new Promise(),
			scope = {},
			thisObj,
			value;

		promise.then(function (val) {
			thisObj = this;
			value = val;
		}, scope);

		promise.fulfill("emily");

		expect(value).toBe("emily");
		expect(thisObj).toBe(scope);
	});

	it("calls the rejection callback within a scope", function () {
		var promise = new Promise(),
			scope = {},
			thisObj,
			reason;

		promise.then(null, function (res) {
			thisObj = this;
			reason = res;
		}, scope);

		promise.reject(false);

		expect(reason).toBe(false);
		expect(thisObj).toBe(scope);
	});

	it("can synchronise a promise with another one, or any thenable", function () {
		var promise1 = new Promise(),
			promise2 = new Promise(),
			synched;

		promise2.sync(promise1);

		promise2.then(function (value) {
			synched = value;
		});

		promise1.fulfill(true);

		expect(synched).toBe(true);
	});

	it("can return the reason of a rejected promise", function () {
		var promise = new Promise();

		promise.reject("reason");

		expect(promise.getReason()).toBe("reason");
	});

	it("can return the value of a fulfilled promise", function () {
		var promise = new Promise();

		promise.fulfill("emily");

		expect(promise.getValue()).toBe("emily");
	});

	it("passes all the promise-A+ tests specs", function () {
		expect('225 tests complete (6 seconds)').toBeTruthy();
	});

});

```

### StateMachine

```js
describe("StateMachine helps you with the control flow of your apps by removing branching if/else", function () {

	it("will call specific actions depending on the current state and the triggered event", function () {
		var passCalled,
			coinCalled,

			stateMachine = new StateMachine("opened", {
			// It has an 'opened' state
			"opened": [
				// That accepts a 'pass' event that will execute the 'pass' action
				["pass", function pass(event) {
					passCalled = event;
				// And when done, it will transit to the 'closed' state
				}, "closed"]
			],

			// It also has a 'closed' state
			"closed": [
				// That accepts a 'coin' event that will execute the 'coin' action
				["coin", function coin(event) {
					coinCalled = event;
				// And when done, it will transit back to the 'opened' state
				}, "opened"]
			]
		});

		expect(stateMachine.getCurrent()).toBe("opened");

		expect(stateMachine.event("nonExistingState")).toBe(false);
		expect(stateMachine.event("pass", "hello")).toBe(true);
		expect(passCalled).toBe("hello");

		expect(stateMachine.getCurrent()).toBe("closed");
		expect(stateMachine.event("coin", "2p")).toBe(true);
		expect(coinCalled).toBe("2p");

		expect(stateMachine.getCurrent()).toBe("opened");
	});

	it("executes the action in the given scope", function () {
		var passThisObject,
			coinThisObject,
			scope = {},

		stateMachine = new StateMachine("opened", {
			"opened": [
				["pass", function pass() {
					passThisObject = this;
				}, scope, "closed"]
			],
			"closed": [
				["coin", function coin() {
					coinThisObject = this;
				}, scope, "opened"]
			]
		});

		stateMachine.event("pass");
		expect(passThisObject).toBe(scope);

		stateMachine.event("coin");
		expect(coinThisObject).toBe(scope);
	});

	it("can handle events that don't necessarily change the state", function () {
		var coinCalled,
			stateMachine = new StateMachine("opened", {
			"opened": [
				["pass", function pass() {
					passThisObject = this;
				}, "closed"],
				["coin", function coin() {
					coinCalled = true;
				}]
			],
			"closed": [
				["coin", function coin() {
					coinThisbject = this;
				}, "opened"]
			]
		});

		stateMachine.event("coin");
		expect(coinCalled).toBe(true);
		expect(stateMachine.getCurrent()).toBe("opened");

	});

	it("can execute given actions upon entering or leaving a state", function () {
		var onEnter,
			onExit,
			stateMachine = new StateMachine("opened", {
			"opened": [
				["pass", function pass() {
					//
				}, "closed"],

				// Exit will be called upon leaving opened
				["exit", function exit() {
					onExit = true;
				}]
			],
			"closed": [

				// Whereas entry will be called upon entering the state
				["entry", function entry() {
					onEnter = true;
				}],
				["coin", function coin() {
					//
				}, "opened"]
			]
		});

		stateMachine.event("pass");

		expect(onExit).toBe(true);
		expect(onExit).toBe(true);

		expect(stateMachine.getCurrent()).toBe("closed");
	});

	it("can be advanced to a given state", function () {
		var stateMachine = new StateMachine("opened", {
			"opened": [
				["pass", function pass() {
					passThisObject = this;
				}, "closed"]
			],
			"closed": [
				["coin", function coin() {
					coinThisObject = this;
				}, "opened"]
			]
		});

		expect(stateMachine.advance("")).toBe(false);
		expect(stateMachine.advance("closed")).toBe(true);
		expect(stateMachine.getCurrent()).toBe("closed");

		expect(stateMachine.advance("opened")).toBe(true);
		expect(stateMachine.getCurrent()).toBe("opened");
	});

});
```

### Transport

```js
describe("Transport hides and centralizes the logic behind requests", function () {

	it("issues requests to request handlers", function () {

		var onEndCalled = false;

		var requestsHandlers = new Store({
			// This function will handle the request specified by payload.
			// It will call the onEnd request when it has received all the data
			// It will call onData for each chunk of data that needs to be sent
			myRequestHandler: function (payload, onEnd) {
				if (payload == "whoami") {
					onEnd("emily");
				}
			}
		});

		var transport = new Transport(requestsHandlers);

		// Issue a request on myRequestHandler with "whoami" in the payload
		transport.request("myRequestHandler", "whoami", function onEnd() {
			onEndCalled = true;
		});

		expect(onEndCalled).toBe(true);
	});

	it("accepts objects as payloads", function () {

		var requestsHandlers = new Store({
			myRequestHandler: function (payload, onEnd) {
				onEnd("Hi " + payload.firstname + " " + payload.lastname);
			}
		}),
		transport,
		response;

		transport = new Transport(requestsHandlers);

		transport.request("myRequestHandler", {
			firstname: "olivier",
			lastname: "scherrer"
		}, function onEnd(data) {
			response = data;
		});

		expect(response).toBe("Hi olivier scherrer");

	});

	it("can also listen to channels and receive data in several chunks", function () {

		var requestsHandlers = new Store({
			// When onEnd is called, no further data can be sent.
			// But when the channel must no be closed, onData can be called instead
			myRequestHandler: function (payload, onEnd, onData) {
				onData("chunk1");
				onData("chunk2");
				onData("chunk3");
				onEnd("chunk4");
			}
		}),
		response = [];

		var transport = new Transport(requestsHandlers);

		transport.listen("myRequestHandler", {}, function onData(data) {
			response.push(data);
		});

		expect(response.length).toBe(4);
		expect(response[0]).toBe("chunk1");
		expect(response[3]).toBe("chunk4");

	});

	it("can close a listening channel on the client end point", function () {
		var aborted = false;

		var requestsHandlers = new Store({
			myRequestHandler: function () {
				return function() {
					aborted = true;
				};
			}
		}),
		transport = new Transport(requestsHandlers),
		abort;

		abort = transport.listen("myRequestHandler", "", function () {});

		abort();

		expect(aborted).toBe(true);
	});

});

```

### Router

```js
describe("Router determines the navigation in your application", function () {

	it("can navigate to routes and pass arguments", function () {
		var router = new Router();

		var routeObserver1 = jasmine.createSpy(),
			routeObserver2 = jasmine.createSpy(),
			scope = {},
			params = {};

		router.set("route1", routeObserver1);
		router.set("route2", routeObserver2, scope);

		router.navigate("route1", params);

		expect(routeObserver1.wasCalled).toBe(true);
		expect(routeObserver1.mostRecentCall.args[0]).toBe(params);
		expect(routeObserver2.wasCalled).toBe(false);

		router.navigate("route2", params);

		expect(routeObserver2.wasCalled).toBe(true);
		expect(routeObserver2.mostRecentCall.args[0]).toBe(params);
		expect(routeObserver2.mostRecentCall.object).toBe(scope);
	});

	it("publishes events when navigating to a new route", function () {
		var router = new Router();

		var observer = jasmine.createSpy(),
			scope = {},
			params = {};

		router.watch(observer, scope);

		router.set("route", function () {});

		router.navigate("route", params);

		expect(observer.wasCalled).toBe(true);
		expect(observer.mostRecentCall.args[0]).toBe("route");
		expect(observer.mostRecentCall.args[1]).toBe(params);
	});

	it("keeps track of the history while navigating", function () {
		var router = new Router();

		var observer = jasmine.createSpy();

		router.watch(observer);

		router.set("route1", function () {});
		router.set("route2", function () {});
		router.set("route3", function () {});
		router.set("route4", function () {});
		router.set("route5", function () {});

		router.setMaxHistory(3);

		router.navigate("route1");
		router.navigate("route2");

		router.back();

		expect(observer.mostRecentCall.args[0]).toBe("route1");

		router.forward();

		expect(observer.mostRecentCall.args[0]).toBe("route2");

		router.navigate("route3");

		router.navigate("route4");

		expect(router.go(-2)).toBe(true);

		expect(observer.mostRecentCall.args[0]).toBe("route2");

		expect(router.back()).toBe(false);

		expect(router.forward()).toBe(true);

		expect(observer.mostRecentCall.args[0]).toBe("route3");

		router.navigate("route5");

		expect(router.forward()).toBe(false);

		router.back();

		expect(observer.mostRecentCall.args[0]).toBe("route3");
	});

	it("can clear the history", function () {
		var router = new Router();

		router.set("route1");
		router.set("route2");

		router.navigate("route1");
		router.navigate("route2");
		router.clearHistory();

		expect(router.back()).toBe(false);
	});

	it("can tell the depth of the history", function () {
		var router = new Router();

		router.set("route1", function () {});
		router.navigate("route1");
		router.navigate("route1");
		router.navigate("route1");
		router.navigate("route1");
		router.navigate("route1");

		expect(router.getHistoryCount()).toBe(5);
	});

	it("has a default max history of 10", function () {
		var router = new Router();

		expect(router.getMaxHistory()).toBe(10);
	});

	it("can remove a route", function () {
		var router = new Router(),
			handle;

		handle = router.set("route1");

		router.unset(handle);

		expect(router.navigate("route1")).toBe(false);
	});

});
```

## Changelog

###1.8.1 - 03 DEC 2013

* Add convenience method observable.once

####1.8.0 - 03 SEP 2013

* Store.reset publishes a "resetted" event when the store is resetted
* Store.reset publishes an "altered" event with the store is altered

####1.7.0 - 04 AUG 2013

* Adds router

####1.6.0 - 17 JUNE 2013

* Adds computed properties to the Store

####1.5.0 - 9 JUNE 2013

* Tools now has closest, closestGreater and closestLower for finding the number in an array that is the closest to a base number.

####1.4.0 - 13 MAY 2013

* Store.proxy now gives direct access to the data structure's methods without publishing diffs, which is much faster (useful for slice for instance)

####1.3.5 - 09 MAR 2013

* Added count alias for getNbItems in Store
* Added proxy alias for alter in Store
* Updated documentation, added integration tests

####1.3.4 - 03 MAR 2013

* Added advance to the state machine

####1.3.3 - 28 JAN 2013

* Added Store.dump
* When store publishes a change event, it publishes both the new and the previous value

####1.3.2 - 22 JAN 2013

* Fixed emily-server breaking olives
* Updated requirejs

####1.3.1 - 1 JAN 2013

* Promise has been updated to pass the promise/A+ specs according to [promiseA+-tests](https://github.com/promises-aplus/promises-tests)
* Updated StateMachine so new transitions can be added on the fly
* Moved the CouchDB handler to CouchDB Emily Tools

####1.3.0 - 16 DEC 2012

 * Promise has been updated to pass the promise/A specs according to [promise-tests](https://github.com/domenic/promise-tests)
 * The build now includes the source files as you should be able to drop them into your application
   to decide how you want to load and optimize them

####1.2.0 - 07 OCT 2012

Removal of CouchDBStore - now part of CouchDB-Emily-Tools

## Going further

Check out [Olives](https://github.com/flams/olives) for scalable MV* applications in the browser.


