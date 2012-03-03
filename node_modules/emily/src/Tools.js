/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Tools",
/**
 * @class
 * Tools is a collection of tools 
 */
function Tools(){

	return {
	    /**
	     * For applications that don't run in a browser, window is not the global object.
	     * This function returns the global object wherever the application runs.
	     * @returns {Object} the global object
	     */
		getGlobal: function getGlobal() {
	    	var func = function() {
	    		return this;
	    	};
	    	return func.call(null);
	    },
		
		/**
		 * Mixes an object into another
		 * @param {Object} destination object to mix values into
		 * @param {Object} source object to get values from
		 * @param {Boolean} optional, set to true to prevent overriding
		 */
	    mixin: function mixin(source, destination, dontOverride) {
			this.loop(source, function (value, idx) {
				if (!destination[idx] || !dontOverride) {
					destination[idx] = source[idx];	
				}
			});
			return destination;
		},
		
		/**
		 * Count the number of properties in an object
		 * It doesn't look up in the prototype chain
		 * @param {Object} object the object to count
		 * @returns {Number}
		 */
		count: function count(object) {
			var nbItems = 0;
			this.loop(object, function () {
				nbItems++;
			});
			
			return nbItems;
		},
		
		/**
		 * Compares the properties of two objects and returns true if they're the same
		 * It's doesn't do it recursively
		 * @param {Object} first object
		 * @param {Object} second object
		 * @returns {Boolean} true if the two objets have the same properties
		 */
		compareObjects: function compareObjects(object1, object2) {
			var getOwnProperties = function (object) {
				return Object.getOwnPropertyNames(object).sort().join("");
			};
			return getOwnProperties(object1) == getOwnProperties(object2);
		},
		
		/**
		 * Transform array-like objects to array, such as nodeLists or arguments
		 * @param {Array-like object}
		 * @returns {Array}
		 */
		toArray: function toArray(array) {
			return Array.prototype.slice.call(array);
		},
		
		/**
		 * Small adapter for looping over objects and arrays
		 * Warning: it's not meant to be used with nodeList
		 * @param {Array/Object} iterated the array or object to loop through
		 * @param {Function} callback the function to execute for each iteration
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns {Boolean} true if executed
		 */
		loop: function loop(iterated, callback, scope) {
			var i, 
				length;
			
			if (iterated instanceof Object && typeof callback == "function") {
				length = iterated.length;
				if (length) {
					for (i=0; i<length; i++) {
						callback.call(scope, iterated[i], i, iterated);
					}
				} else {
					for (i in iterated) {
						if (iterated.hasOwnProperty(i)) {
							callback.call(scope, iterated[i], i, iterated);
						}
					}
				}
				return true;
			} else {
				return false;
			}
		},
		
		/**
		 * Make a diff between two objects
		 * @param {Array/Object} before is the object as it was before
		 * @param {Array/Object} after is what it is now
		 * @example: 
		 * 	With objects:
		 * 
		 * 	before = {a:1, b:2, c:3, d:4, f:6}
		 * 	after = {a:1, b:20, d: 4, e: 5}
		 * 	will return : 
		 * 	{
		 *  	unchanged: ["a", "d"],
		 *  	updated: ["b"],
		 *  	deleted: ["f"],
		 *  	added: ["e"]
		 * 	}
		 * 
		 * It also works with Arrays:
		 * 
		 * 	before = [10, 20, 30]
		 * 	after = [15, 20]
		 * 	will return : 
		 * 	{
		 *  	unchanged: [1],
		 *  	updated: [0],
		 *  	deleted: [2],
		 *  	added: []
		 * 	}
		 * 
		 * @returns object
		 */
		objectsDiffs : function objectsDiffs(before, after) {
			if (before instanceof Object && after instanceof Object) {
				var unchanged = [],
					updated = [],
					deleted = [],
					added = [];
				
				 // Look through the after object
				 this.loop(after, function (value, idx) {
					 
					 // To get the updated
					 if (value !== before[idx] && typeof before[idx] != "undefined") {
						 updated.push(idx);
						 
					 // The unchanged	 
					 } else if (value === before[idx]) {
						 unchanged.push(idx);
					
					 // And the added
					 } else if (typeof before[idx] == "undefined") {
						 added.push(idx);
					 }
				 });
				 
				 // Loop through the before object
				 this.loop(before, function (value, idx) {
					 
					// To get the deleted 
					if (typeof after[idx] == "undefined") {
						deleted.push(idx);
					} 
				 });
				 
				return {
					updated: updated,
					unchanged: unchanged,
					added: added,
					deleted: deleted
				};
				
			} else {
				return false;
			}
		},
		
		/**
		 * Transforms Arrays and Objects into valid JSON
		 * @param {Object/Array} object the object to JSONify 
		 * @returns the JSONified object or false if failed
		 */
		jsonify: function jsonify(object) {
			if (object instanceof Object) {
				return JSON.parse(JSON.stringify(object));	
			} else {
				return false;
			}
		},
		
		/**
		 * Clone an Array or an Object
		 * @param {Array/Object} object the object to clone
		 * @returns {Array/Object} the cloned object
		 */
		clone: function clone(object) {
			if (object instanceof Array) {
				return object.slice(0);
			} else if (typeof object == "object" && object !== null && !(object instanceof RegExp)) {
				return this.mixin(object, {});
			} else {
				return object;
			}
		},
		
		
		/**
		 * 
		 * 
		 * 
		 * 
		 * Refactoring needed for the following 
		 * 
		 * 
		 * 
		 * 
		 * 
		 */
		
		/**
		 * Get the property of an object nested in one or more objects
		 * given an object such as a.b.c.d = 5, getObject(a, "b.c.d") will return 5.
		 * @param {Object} object the object to get the property from
		 * @param {String} property the path to the property as a string
		 * @returns the object or the the property value if found
		 */
		getNestedProperty: function getNestedProperty(object, property) {
			if (object && object instanceof Object) {
				if (typeof property == "string" && property != "") {
					var split = property.split(".");
					split.unshift(object);
					return split.reduce(function (obj, prop) {
						return obj[prop];
					});
				} else if (typeof property == "number") {
					return object[property];
				} else {
					return object;
				}
			} else {
				return object;
			}
		},
		
		/**
		 * Set the property of an object nested in oen or more objects
		 * @param {Object} object
		 * @param {String} property
		 * @param value the value to set
		 * @returns object if no assignment was made or the value if the assignment was made
		 */
		setNestedProperty: function setNestedProperty(object, property, value) {
			if (object && object instanceof Object) {
				if (typeof property == "string" && property != "") {
					var split = property.split(".");
					split.unshift(object);
					return split.reduce(function (obj, prop, idx) {
						if (split.length == (idx + 1)) {
							obj[prop] = value;
						}
						return obj[prop];
					});
				} else if (typeof property == "number") {
					object[property] = value;
					return object[property];
				} else {
					return object;
				}
			} else {
				return object;
			}
		}
		
		
		
	};
	
	
});
		