function Olives(FWK) {
	
	var _namespace = "Olives",
		_addNS = function (name) {
			return _namespace + "." + name;
		};
		
	this.define = function define(name, inherits, constructor) {
		inherits = typeof inherits == "string" ? _addNS(inherits) : inherits;
		return FWK.declare(_addNS(name), inherits, constructor);
	};
		
	this.create = function create(name) {
		return Object.create(FWK.require(_addNS(name)));
	};
};

var Olives = new Olives(Emily);Olives.define("Text", "_base", function Text() {
		
});Olives.define("_base", function _base(API) {
	
	this.model = API.require("TinyStore").create();
	
});