/**
* This server is only for testing purpose.
* It assumes you have a CouchDB up and running on localhost:5984
* With a database called "db" and a document "document2" with a property "hey"
*/
var requirejs = require("requirejs"),
	// This should be require("emily"); once published
	emily = require("../emily-server.js");

requirejs(["Store"], function (Store) {
	var store = new Store(["Hello"]);
	console.log(store.get(0) + " world!");
});
