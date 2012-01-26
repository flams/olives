define("Olives/List",
		
["Olives/OObject", "Olives/Model-plugin"], 

function (OObject, ModelPlugin) {
	
	function ListConstructor() {
		
		this.template = "<ul data-model='toList'><li data-model='toText'></li></ul>";
		
		this.plugins.add("model", new ModelPlugin(this.model));
		
	}
	
	return function ListFactory(store) {
		ListConstructor.prototype = new OObject(store);
		return new ListConstructor();
	};
	
});