define("Olives/OObject", ["Tools", "TinyStore"],
/** 
* @class 
* _base is an abstract class that every UI can inherit from.
* It should provide code that is easy to reuse
*/
function OObject(Tools, Tinystore) {
	
	return {
		/**
		 * The model of the UI is a TinyStore
		 * @type object
		 */
		model: Tinystore.create(),
	
		/**
		 * The UI's template.
		 * @type HTMLElement
		 */
		template: null,
		
		/**
		 * Connects contains references to dom nodes with data-connect attributes
		 * @type object 
		 */
		connects: {},
		
		/**
		 * Render the UI at a given place (dom node)
		 * @param {HTMLElement} rootNode the node where to append the UI
		 * @returns {Object} the UI
		 */
		place: function place(parentNode) {
			
			Tools.toArray(this.template.querySelectorAll("[data-connect]")).forEach(function (node) {
				this.connects[node.getAttribute("data-connect")] = node;
			}, this);
	
			parentNode.appendChild(this.template);		
			return parentNode;
		}
	};
	
});define("Olives/Text",
	
["Olives/OObject"],

/** 
* @class 
* Text is a simple paragraph with a unique property that shows the way UI work.
*/		
function Text(OObject) {
	
	function _Text() {
		
	}
	
	return {
		create: function create() {
			_Text.prototype = OObject;
			return new _Text;
		}
	}

	
});