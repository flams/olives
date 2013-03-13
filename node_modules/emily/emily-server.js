/**
 * Emily
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
var requirejs = require("requirejs");

// Load Emily
requirejs(__dirname + "/build/Emily.js");

// We're going to need Store to store the handlers.
// The Store's observers can be useful. They'll actually be used by Olives
var Store = requirejs("Store");

module.exports.handlers = new Store({});

// Use requirejs to load Emily's modules
module.exports.requirejs = requirejs;



