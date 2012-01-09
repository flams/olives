define("Olives/Text",
	
["Olives/OObject"],

/** 
* @class 
* Text is a simple paragraph with a unique property that shows the way UI work.
*/		
function Text(OObject) {
	
	function TextConstructor(texts) {
		
		/**
		 * Set the paragraph's innherHTML with given content
		 * @param {String} content the text
		 */
		var setInnerHTML = function setInnerHTML(node, value) {
			node.innerHTML = value;		
		};
		
		/**
		 * Construction of the UI
		 */
		// Sets the data
		this.model.reset(texts);
		// Watch for modifications
		this.model.watch("updated", function (name, value) {
			setInnerHTML(this.connects[name], value);
		}, this);
		
		/**
		 * The UI's template that will generate the dom nodes to be placed on the application's page.
		 */
		this.template = "<p data-connect='content'></p>";

		/**
		 * onRender is called after action("render")
		 */
		this.onRender = function onRender() {
			for (var name in this.connects) {
				if (this.model.has(name)) {
					setInnerHTML(this.connects[name], this.model.get(name));
				} else {
					this.model.set(name, this.connects[name].innerHTML);
				}

			}
		};
		
	}
	
	return function TextFactory(texts) {
		TextConstructor.prototype = new OObject;
		return new TextConstructor(texts);
	};

	
});