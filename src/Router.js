/**
 * https://github.com/flams/Olives-services
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */

define(["Observable", "Store"],

/**
 * @class
 * Routing allows for navigating in an application by defining routes.
 */
function Router(Observable, Store) {

	return function RouterConstructor() {

		/**
		 * The routes observable (the applications use it)
		 * @private
		 */
		var _routes = new Observable(),

		/**
		 * The events observable (used by Routing)
		 * @private
		 */
		_events = new Observable(),

		/**
		 * The routing history
		 * @private
		 */
		_history = new Store([]),

		/**
		 * For navigating through the history, remembers the current position
		 * @private
		 */
		_currentPos = 0;

		/**
		 * Only for debugging
		 * @private
		 */
		this.getRoutesObservable = function getRoutesObservable() {
			return _routes;
		};

		/**
		 * Only for debugging
		 * @private
		 */
		this.getEventsObservable = function getEventsObservable() {
			return _events;
		};

		/**
		 * Set a new route
		 * @param {String} route the name of the route
		 * @param {Function} func the function to be execute when navigating to the route
		 * @param {Object} scope the scope in which to execute the function
		 * @returns a handle to remove the route
		 */
		this.set = function set() {
			return _routes.watch.apply(_routes, arguments);
		};

		/**
		 * Remove a route
		 * @param {Object} handle the handle provided by the set method
		 * @returns true if successfully removed
		 */
		this.unset = function unset(handle) {
			return _routes.unwatch(handle);
		};

		/**
		 * Navigate to a route
		 * @param {String} route the route to navigate to
		 * @param {*} *params
		 * @returns
		 */
		this.navigate = function get(route, params) {
			if (this.load(route, params)) {
				_history.alter("push", {
					route: route,
					params: params
				});
				_currentPos = _history.getNbItems();
				return true;
			} else {
				return false;
			}

		};

		/**
		 * Actually loads the route
		 * @private
		 */
		this.load = function load(route, params) {
			if (_routes.notify(route, params)) {
				_events.notify("route", route);
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Watch for route changes
		 * @param {Function} func the func to execute when the route changes
		 * @param {Object} scope the scope in which to execute the function
		 * @returns {Object} the handle to unwatch for route changes
		 */
		this.watch = function watch(func, scope) {
			return _events.watch("route", func, scope);
		};

		/**
		 * Unwatch routes changes
		 * @param {Object} handle the handle was returned by the watch function
		 * @returns true if unwatch
		 */
		this.unwatch = function unwatch(handle) {
			return _events.unwatch(handle);
		};

		/**
		 * Get the history store, for debugging only
		 * @private
		 */
		this.getHistoryStore = function getHistoryStore() {
			return _history;
		};

		/**
		 * Go back and forth in the history
		 * @param {Number} nb the amount of history to rewind/forward
		 * @returns true if history exists
		 */
		this.go = function go(nb) {
			var history = _history.get(_currentPos + nb);

			if (history) {
				this.load(history.route, history.params);
				_currentPos += nb;
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Go back in the history, short for go(-1)
		 * @returns
		 */
		this.back = function back() {
			return this.go(-1);
		};

		/**
		 * Go forward in the history, short for go(1)
		 * @returns
		 */
		this.forward = function forward() {
			return this.go(1);
		};

	};

});