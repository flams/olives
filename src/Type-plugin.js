define("Olives/Type-plugin", 
		
["Olives/OObject", "Tools"],
		
function (OObject, Tools) {
	
	return function TypePluginConstructor($uis) {
	
		var _uis = {};
		
		this.place = function place(node, name) {
			if (_uis[name] instanceof OObject) {
				_uis[name].action("place", node);
			} else {
				throw new Error(name + " is not an OObject UI in place:"+name);
			}
		};
		
		this.set = function set(name, ui) {
			if (typeof name == "string" && ui instanceof OObject) {
				_uis[name] = ui;
				return true;
			} else {
				return false;
			}
		};
		
		this.setAll = function setAll(uis) {
			Tools.loop(uis, function (ui, name) {
				this.set(name, ui);
			}, this);
		};
		
		this.get = function get(name) {
			return _uis[name];
		};
		
		this.setAll($uis);
		
	};
	
});