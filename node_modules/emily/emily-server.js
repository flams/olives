/**
 * Emily
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
// Load Emily
var Emily = require(__dirname + "/build/src/Emily.js");

module.exports = Emily;

// We're going to need Store to store the handlers.
// The Store's observers can be useful. They'll actually be used by Olives
module.exports.handlers = new Emily.Store({});
