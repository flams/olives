Extensive documentation, along with unit tests and JsDoc can be found here: http://flams.github.com/olives/

###What is Olives?

 * Olives is a JS MVC framework that helps you create realtime UIs.
 * It's a set of AMD/commonJS modules that you can extend with little to no effort.
 * It offers a high level of abstraction that greatly reduces boilerplate.
 * It can seamlessly integrate with graphical libraries.
 * It doesn't require you to learn a custom templating language.
 * It's based on Emily and socket.io to provide a simple and powerful way of communicating with a node.js server.

###What modules does Olives provide?

 * OObject: the spine of your UI.
 * Plugins: extend Olives functionalities with your own plugins.
 * ModelPlugin: a built-in plugin that synchronizes your View with the Model.
 * EventPlugin: make your dom listen to events.
 * TypePlugin: compose UIs with multiple UIs.
 * Transport: connect your UI with a node.js server using socket.io. This is the realtime part of Olives.
 * LocalStore: A subtype of Emily Store for saving your model into localStorage.
 * CouchDBStore: A subtype of Emily Store for saving your model into a CouchDB database.

Olives is based on Emily: https://github.com/flams/emily

The documentation for each module can be found here: http://flams.github.com/emily/ 

###How do I install it?

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
 
require(["Olives/Module"], function (Module) {
	// Olives modules are prefixed with Olives
});
```
				
If your application is based on node and you want the realtime part of Olives, on the server side, do:

```
npm install requirejs
npm install olives
``` 

```js
var olives = require("olives");
 
// Register your instance of socket.io
olives.registerSocketIO(io);
```

###Live example

The todo application: http://flams.github.com/olives/todo/index.html

###There are already so many frameworks out there, why would I choose Olives?

Olives is only a set of AMD/commonJS modules. You can pick up the parts that you need, or like, and build stuff around them.

If you decide to go for all Olive's modules, then you have a set of powerful tools to create MVC applications.

Olives lets you decide what piece of software best suites you and your projects.

###Contributing to Olives

Contributors are more than welcome. To be part of Olives, a new module should follow these requirements:

 * It should use only standard technologies.
 * It should let native features be usable out of the box and not re-implement them.
 * It should use the latest standard features when they're the best way to achieve something.
 * It should be 100% TDD, with 100% code coverage.
 * It should be in AMD format.
 
###Olives helps you focus on features, not on plumbing.