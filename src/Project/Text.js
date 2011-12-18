define("Olives/Text",
	
["Olives/OObject"],

/** 
* @class 
* Text is a simple paragraph with a unique property that shows the way UI work.
*/		
function Text(OObject) {
	
	function _Text(content) {
		
		/**
		 * The UI's template that will generate the dom nodes to be placed on the application's page.
		 */
		this.template = "<p data-connect='content'></p>";
		
		/**
		 * Set the paragraph's innherHTML with given content
		 * @param {String} content the text
		 */
		this.setContent = function setContent(content) {
			this.connects["content"].innerHTML = content;
		};

		/**
		 * onRender is called after action("render")
		 */
		this.onRender = function onRender() {
			this.setContent(this.model.get("content"));
		};

		// If a content is given at init, set it.
		content && this.model.set("content", content);
		// Watch for its modifications
		this.model.watch("content", this.setContent, this);	
		
	}
	
	return {
		/**
		 * Create a new Text UI
		 * @returns the new ui
		 */
		create: function create(content) {
			var augmentedText = OObject.augment(_Text);
			var text = new augmentedText(content);
			return text;
		}
	};

	
});