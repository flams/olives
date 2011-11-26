function Olives(FWK) {
	
	var _namespace = "Olives",
		_addNS = function (name) {
			return _namespace + "." + name;
		};
		
	this.declare = function declare(name, constructor) {
			if (typeof name == "string" && typeof constructor == "function") {
				return FWK.declare(_addNS(name), constructor);
			} else {
				return false;
			}
		};
		
	this.require = function require(name) {
		return FWK.require(_addNS(name));
	};
};

var Olives = new Olives(Emily);