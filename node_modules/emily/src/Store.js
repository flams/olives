/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Store", ["Observable", "Tools"],
/** 
 * @class
 * Store creates a small NoSQL database with observables
 * It can publish events on store/data changes
 */
 function Store(Observable, Tools) {
	
	/**
	 * Defines the Store
	 * @private
	 * @param values
	 * @returns
	 */
	return function StoreConstructor($data) {
		
		/**
		 * Where the data is stored
		 * @private
		 */
		var _data = Tools.clone($data) || {},
		
		/**
		 * The observable
		 * @private
		 */
		_storeObservable = new Observable(),
		
		_valueObservable = new Observable(),
		
		/**
		 * Gets the difference between two objects and notifies them
		 * @private
		 * @param previousData
		 * @returns
		 */
		_notifyDiffs = function _notifyDiffs(previousData) {
			var diffs = Tools.objectsDiffs(previousData, _data);
			["updated",
			 "deleted",
			 "added"].forEach(function (value) {
				 diffs[value].forEach(function (dataIndex) {
						_storeObservable.notify(value, dataIndex, _data[dataIndex]);
						_valueObservable.notify(dataIndex, _data[dataIndex], value);
				 });
			});
		};
		
		/**
		 * Get the number of items in the store
		 * @returns {Number} the number of items in the store
		 */
		this.getNbItems = function() {
			return _data instanceof Array ? _data.length : Tools.count(_data);
		};
		
		/**
		 * Get a value from its index
		 * @param {String} name the name of the index
		 * @returns the value
		 */
		this.get = function get(name) {
			return _data[name];
		};
		
		/**
		 * Checks if the store has a given value
		 * @param {String} name the name of the index
		 * @returns {Boolean} true if the value exists
		 */
		this.has = function has(name) {
			return _data.hasOwnProperty(name);
		};
		
		/**
		 * Set a new value and overrides an existing one
		 * @param {String} name the name of the value
		 * @param value the value to assign
		 * @returns true if value is set
		 */
		this.set = function set(name, value) {
			var ante,
				action;
			
			if (typeof name != "undefined") {
				ante = this.has(name);
				_data[name] = value;
				action = ante ? "updated" : "added";
				_storeObservable.notify(action, name, _data[name]);	
				_valueObservable.notify(name, _data[name], action);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Delete value from its index
		 * @param {String} name the name of the index from which to delete the value
		 * @returns true if successfully deleted.
		 */
		this.del = function del(name) {
			if (this.has(name)) {
				if (!this.alter("splice", name, 1)) {
					delete _data[name];
					_storeObservable.notify("deleted", name);
					_valueObservable.notify(name, _data[name], "deleted");
				}
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Alter the data be calling one of it's method
		 * When the modifications are done, it notifies on changes.
		 * @param {String} func the name of the method
		 * @returns the result of the method call
		 */
		this.alter = function alter(func) {
			var apply,
				previousData;
			
			if (_data[func]) {
				previousData = Tools.clone(_data);
				apply = _data[func].apply(_data, Array.prototype.slice.call(arguments, 1));
				_notifyDiffs(previousData);
				return apply;
			} else {
				return false;
			}
		};
		
		/**
		 * Watch the store's modifications
		 * @param {String} added/updated/deleted
		 * @param {Function} func the function to execute
		 * @param {Object} scope the scope in which to execute the function
		 * @returns {Handler} the subscribe's handler to use to stop watching
		 */
		this.watch = function watch(name, func, scope) {
			return _storeObservable.watch(name, func, scope);
		};
		
		/**
		 * Unwatch the store modifications
		 * @param {Handler} handler the handler returned by the watch function
		 * @returns
		 */
		this.unwatch = function unwatch(handler) {
			return _storeObservable.unwatch(handler);
		};
		
		/**
		 * Get the observable used for watching store's modifications
		 * Should be used only for debugging
		 * @returns {Observable} the Observable
		 */
		this.getStoreObservable = function getStoreObservable() {
			return _storeObservable;
		};
		
		/**
		 * Watch a value's modifications
		 * @param {String} name the name of the value to watch for
		 * @param {Function} func the function to execute
		 * @param {Object} scope the scope in which to execute the function
		 * @returns true if unwatched
		 */
		this.watchValue = function watchValue(name, func, scope) {
			return _valueObservable.watch(name, func, scope);
		};
		
		/**
		 * Unwatch the value's modifications
		 * @param {Handler} handler the handler returned by the watchValue function
		 * @returns true if unwatched
		 */
		this.unwatchValue = function unwatchValue(handler) {
			return _valueObservable.unwatch(handler);
		};
		
		/**
		 * Get the observable used for watching value's modifications
		 * Should be used only for debugging
		 * @returns {Observable} the Observable
		 */
		this.getValueObservable = function getValueObservable() {
			return _valueObservable;
		};

		/**
		 * Loop through the data
		 * @param {Function} func the function to execute on each data
		 * @param {Object} scope the scope in wich to run the callback
		 */
		this.loop = function loop(func, scope) {
			Tools.loop(_data, func, scope);
		};
		
		/**
		 * Reset all data and get notifications on changes
		 * @param {Arra/Object} data the new data
		 * @returns {Boolean}
		 */
		this.reset = function reset(data) {
			if (data instanceof Object) {
				var previousData = Tools.clone(_data);
				_data = Tools.clone(data) || {};
				_notifyDiffs(previousData);
				return true;
			} else {
				return false;
			}

		};
		
		/**
		 * Dumps a JSON version of all the data
		 * @returns {JSON}
		 */
		this.toJSON = function toJSON() {
			return JSON.stringify(_data);
		};
	};
});