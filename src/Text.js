define("Olives/Text",
	
["Olives/OObject", "Olives/Model-plugin"],

/** 
* @class 
* Text is a simple paragraph with a unique property that shows the way UI work.
*/		
function Text(OObject, ModelPlugin) {
	
	function TextConstructor(texts) {
		
		/**
		 * The UI's template that will generate the dom nodes to be placed on the application's page.
		 */
		this.template = "<p data-model='toText:content'></p>";
		
		this.model.reset(texts);
		
		this.plugins.add("model", new ModelPlugin(this.model));

		
	}
	
	return function TextFactory(texts) {
		TextConstructor.prototype = new OObject;
		return new TextConstructor(texts);
	};

	
});