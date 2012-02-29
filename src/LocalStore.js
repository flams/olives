/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/LocalStore", 
		
["Store", "Tools"],
		
/**
 * @class
 * LocalStore is an Emily's Store that can be synchronized with localStorage
 * Synchronize the store, reload your page/browser and resynchronize it with the same value
 * and it gets restored.
 * Only valid JSON data will be stored
 */
function LocalStore(Store, Tools) {
	
	function LocalStoreConstructor() {
		
		/**
		 * The name of the property in which to store the data 
		 * @private
		 */
		var _name = null,
		
		/**
		 * Saves the current values in localStorage
		 * @private
		 */
		setLocalStorage = function () {
			localStorage.setItem(_name, this.toJSON());
		};
		
		/**
		 * Synchronize the store with localStorage
		 * @param {String} name the name in which to save the data
		 * @returns {Boolean} true if the param is a string
		 */
		this.sync = function sync(name) {
			if (typeof name == "string") {
				_name = name;
				Tools.loop(JSON.parse(localStorage.getItem(name)), function (value, idx) {
					if (!this.has(idx)) {
						this.set(idx, value);
					}
				}, this);
				setLocalStorage.call(this);
				return true;
			} else {
				return false;
			}
		};
		
		// Watch for modifications to update localStorage
		this.watch("added", setLocalStorage, this);
		this.watch("updated", setLocalStorage, this);
		this.watch("deleted", setLocalStorage, this);
		
	}
	
	return function LocalStoreFactory() {
		LocalStoreConstructor.prototype = new Store;
		return new LocalStoreConstructor;
	};
	
});