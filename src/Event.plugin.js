/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

define(function () {

	return function EventPluginConstructor(parent) {

		this.listen = function(node, event, listener, useCapture) {
			node.addEventListener(event, function(e) {
				parent[listener].call(parent,e, node);
			}, (useCapture == "true"));
		};
	};

});
