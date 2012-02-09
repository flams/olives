define("Olives/Event-plugin", function () {
	
	return function EventPluginConstructor(parent) {

		this.listen = function(node, event, listener) {
			node.addEventListener(event,parent[listener]);
		};	
	};
	
});