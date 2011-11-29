Olives.define("_base", function _base(API) {
	
	this.model = API.require("TinyStore").create();
	
	this.bind = function bind(node, field, func, scope) {
		return this.model.watch(field, func || function (value) {
			node.innerHTML = value;
		}, scope);
	};
	
	this.unbind = function unbind(handler) {
		return this.model.unwatch(handler);
	};
	
});