/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

define(["Router"],

/**
 * @class
 * A locationRouter is a router which navigates to the route defined in the URL and updates this URL
 * while navigating. It's a subtype of Emily's Router
 */
function LocationRouter(Router) {

	"use strict";

	function LocationRouterConstructor() {



	}

	return function LocationRouterFactory() {
		LocationRouterConstructor.prototype = new Router();
		return new LocationRouterConstructor;
	};

});
