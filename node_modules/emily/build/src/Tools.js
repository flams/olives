/**
 * Emily
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

/**
 * @class
 * Tools is a collection of tools
 */

/**
 * Get the closest number in an array
 * @param {Number} item the base number
 * @param {Array} array the array to search into
 * @param {Function} getDiff returns the difference between the base number and
 *   and the currently read item in the array. The item which returned the smallest difference wins.
 * @private
 */
function _getClosest(item, array, getDiff) {
    var closest,
        diff;

    if (!array) {
        return;
    }

    array.forEach(function (comparedItem, comparedItemIndex) {
        var thisDiff = getDiff(comparedItem, item);

        if (thisDiff >= 0 && (typeof diff == "undefined" || thisDiff < diff)) {
            diff = thisDiff;
            closest = comparedItemIndex;
        }
    });

    return closest;
}

module.exports = {
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
     * @param {Object} source object to get values from
     * @param {Object} destination object to mix values into
     * @param {Boolean} optional, set to true to prevent overriding
     * @returns {Object} the destination object
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
     * Compares two numbers and tells if the first one is bigger (1), smaller (-1) or equal (0)
     * @param {Number} number1 the first number
     * @param {Number} number2 the second number
     * @returns 1 if number1>number2, -1 if number2>number1, 0 if equal
     */
    compareNumbers: function compareNumbers(number1, number2) {
          if (number1>number2) {
            return 1;
          } else if (number1<number2) {
            return -1;
          } else {
             return 0;
          }
    },

    /**
     * Transform array-like objects to array, such as nodeLists or arguments
     * @param {Array-like object}
     * @returns {Array}
     */
    toArray: function toArray(array) {
        return [].slice.call(array);
    },

    /**
     * Small adapter for looping over objects and arrays
     * Warning: it's not meant to be used with nodeList
     * To use with nodeList, convert to array first
     * @param {Array/Object} iterated the array or object to loop through
     * @param {Function} callback the function to execute for each iteration
     * @param {Object} scope the scope in which to execute the callback
     * @returns {Boolean} true if executed
     */
    loop: function loop(iterated, callback, scope) {
        var i,
            length;

        if (iterated instanceof Object && callback instanceof Function) {
            if (iterated instanceof Array) {
                for (i=0; i<iterated.length; i++) {
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
     *  With objects:
     *
     *  before = {a:1, b:2, c:3, d:4, f:6}
     *  after = {a:1, b:20, d: 4, e: 5}
     *  will return :
     *  {
     *      unchanged: ["a", "d"],
     *      updated: ["b"],
     *      deleted: ["f"],
     *      added: ["e"]
     *  }
     *
     * It also works with Arrays:
     *
     *  before = [10, 20, 30]
     *  after = [15, 20]
     *  will return :
     *  {
     *      unchanged: [1],
     *      updated: [0],
     *      deleted: [2],
     *      added: []
     *  }
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

                 // To get the added
                 if (typeof before[idx] == "undefined") {
                     added.push(idx);

                 // The updated
                 } else if (value !== before[idx]) {
                     updated.push(idx);

                 // And the unchanged
                 } else if (value === before[idx]) {
                     unchanged.push(idx);
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
            return false;
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
     * given an object such as a.b.c.d = 5, getNestedProperty(a, "b.c.d") will return 5.
     * @param {Object} object the object to get the property from
     * @param {String} property the path to the property as a string
     * @returns the object or the the property value if found
     */
    getNestedProperty: function getNestedProperty(object, property) {
        if (object && object instanceof Object) {
            if (typeof property == "string" && property !== "") {
                var split = property.split(".");
                return split.reduce(function (obj, prop) {
                    return obj && obj[prop];
                }, object);
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
     * Set the property of an object nested in one or more objects
     * If the property doesn't exist, it gets created.
     * @param {Object} object
     * @param {String} property
     * @param value the value to set
     * @returns object if no assignment was made or the value if the assignment was made
     */
    setNestedProperty: function setNestedProperty(object, property, value) {
        if (object && object instanceof Object) {
            if (typeof property == "string" && property !== "") {
                var split = property.split(".");
                return split.reduce(function (obj, prop, idx) {
                    obj[prop] = obj[prop] || {};
                    if (split.length == (idx + 1)) {
                        obj[prop] = value;
                    }
                    return obj[prop];
                }, object);
            } else if (typeof property == "number") {
                object[property] = value;
                return object[property];
            } else {
                return object;
            }
        } else {
            return object;
        }
    },

    /**
     * Get the closest number in an array given a base number
     * Example: closest(30, [20, 0, 50, 29]) will return 3 as 29 is the closest item
     * @param {Number} item the base number
     * @param {Array} array the array of numbers to search into
     * @returns {Number} the index of the closest item in the array
     */
    closest: function closest(item, array) {
        return _getClosest(item, array, function (comparedItem, item) {
            return Math.abs(comparedItem - item);
        });
    },

    /**
     * Get the closest greater number in an array given a base number
     * Example: closest(30, [20, 0, 50, 29]) will return 2 as 50 is the closest greater item
     * @param {Number} item the base number
     * @param {Array} array the array of numbers to search into
     * @returns {Number} the index of the closest item in the array
     */
    closestGreater: function closestGreater(item, array) {
        return _getClosest(item, array, function (comparedItem, item) {
            return comparedItem - item;
        });
    },

    /**
     * Get the closest lower number in an array given a base number
     * Example: closest(30, [20, 0, 50, 29]) will return 0 as 20 is the closest lower item
     * @param {Number} item the base number
     * @param {Array} array the array of numbers to search into
     * @returns {Number} the index of the closest item in the array
     */
    closestLower: function closestLower(item, array) {
        return _getClosest(item, array, function (comparedItem, item) {
            return item - comparedItem;
        });
    }



};


