define("Olives/List",
		
["Olives/OObject", "Olives/Model-plugin"], 

function (OObject, ModelPlugin) {
	
	function ListConstructor(array) {
		
		this.template = "<ul data-model='toList'><li></li></ul>";

		this.model.reset(array);
		
		this.plugins.add("model", new ModelPlugin(this.model));
		
	}
	
	return function ListFactory(array) {
		ListConstructor.prototype = new OObject;
		return new ListConstructor(array);
	};
	
});