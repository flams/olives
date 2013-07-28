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
		_currentPos = -1,

		/**
		 * The depth of the history
		 * @private
		 */
		_maxHistory = 10;

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
		 * Set the maximum length of history
		 * As the user navigates through the application, the
		 * routeur keeps track of the history. Set the depth of the history
		 * depending on your need and the amount of memory that you can allocate it
		 * @param {Number} maxHistory the depth of history
		 * @returns {Boolean} true if maxHistory is equal or greater than 0
		 */
		this.setMaxHistory = function setMaxHistory(maxHistory) {
			if (maxHistory >= 0) {
				_maxHistory = maxHistory;
				return true;
			} else {
				return false;
			}

		};

		/**
		 * Get the current max history setting
		 * @returns {Number} the depth of history
		 */
		this.getMaxHistory = function getMaxHistory() {
			return _maxHistory;
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
				// Before adding a new route to the history, we must clear the forward history
				_history.proxy("splice", _currentPos +1, _history.count());
				_history.proxy("push", {
					route: route,
					params: params
				});
				this.ensureMaxHistory(_history);
				_currentPos = _history.count() -1;
				return true;
			} else {
				return false;
			}

		};

		/**
		 * Ensure that history doesn't grow bigger than the max history setting
		 * @param {Store} history the history store
		 * @private
		 */
		this.ensureMaxHistory = function ensureMaxHistory(history) {
			var count = history.count(),
				max = this.getMaxHistory(),
				excess = count - max;

			if (excess > 0) {
				history.proxy("splice", 0, excess);
			}
		};

		/**
		 * Actually loads the route
		 * @private
		 */
		this.load = function load(route, params) {
			if (_routes.notify(route, params)) {
				_events.notify("route", route, params);
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
		 * Get the current length of history
		 * @returns {Number} the length of history
		 */
		this.getHistoryCount = function getHistoryCount() {
			return _history.count();
		};

		/**
		 * Flush the entire history
		 */
		this.clearHistory = function clearHistory() {
			_history.reset([]);
		};

		/**
		 * Go back and forth in the history
		 * @param {Number} nb the amount of history to rewind/forward
		 * @returns true if history exists
		 */
		this.go = function go(nb) {
			var history = _history.get(_currentPos + nb);

			if (history) {
				_currentPos += nb;
				this.load(history.route, history.params);
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