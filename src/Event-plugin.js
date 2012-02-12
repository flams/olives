define("Olives/Event-plugin", function () {
	
	return function EventPluginConstructor(parent) {

		this.listen = function(node, event, listener) {
			node.addEventListener(event,function (e) {
				parent[listener].call(parent, e, node);
			}, true);
		};	
	};
	
});