function Olives(FWK) {
		
	this.declare = function declare(name, constructor) {
			if (typeof name == "string" && typeof constructor == "function") {
				return FWK.declare(name, constructor);
			} else {
				return false;
			}
		};
		
	this.require = function require(name) {
		return FWK.require(name);
	};
};

var Olives = new Olives(Emily);