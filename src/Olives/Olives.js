/**
 * @class
 * Olives is the UI loader
 * It's based on Emily
 * You can define UIElements and create new instances of them.
 */
function Olives(FWK) {
	
	/**
	 * Olives' namespace in Emily
	 * @private
	 */
	var _namespace = "Olives",
	
	/**
	 * Builds up the namespace
	 * @private
	 * @param {String} name the name of the UI
	 * @returns {String} the UI's namespace
	 */
	_addNS = function (name) {
		return _namespace + "." + name;
	};
		
	/**
	 * defines a new UI
	 * @param {String} name the name of the class
	 * @param {String} inherits the name of the class it inherits from (optional)
	 * @param {Function} constructor the function constructor
	 * @returns {Function} the function constructor
	 */
	this.define = function define(name, inherits, constructor) {
		inherits = typeof inherits == "string" ? _addNS(inherits) : inherits;
		return FWK.declare(_addNS(name), inherits, constructor);
	};
		
	/**
	 * creates a new instance of a previously declared class
	 * @param {String} name the name of the UI to create
	 * @returns {Object} the new UI instance
	 */
	this.create = function create(name) {
		return Object.create(FWK.require(_addNS(name)));
	};
};

var Olives = new Olives(Emily);