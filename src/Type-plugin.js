define("Olives/Type-plugin", function () {
	
	return function TypePluginConstructor() {
	
		this.ui = function ui(node, name) {
			require([name], function (UI) {
				var ui = new UI;
				ui.action("place", node);
			});
			
		};
		
	};
	
});