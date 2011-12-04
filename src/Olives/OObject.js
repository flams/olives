Olives.define("OObject",
/** 
* @class 
* _base is an abstract class that every UI can inherit from.
* It should provide code that is easy to reuse
*/
function OObject(API) {
		
	/**
	 * The model of the UI is a TinyStore
	 * @type object
	 */
	this.model = API.require("TinyStore").create();

	/**
	 * The UI's template.
	 * @type string
	 */
	this.template = "";
	
	/**
	 * Connects contains references to dom nodes with data-connect attributes
	 * @type object 
	 */
	this.connects = {};
	
	/**
	 * Render the UI at a given place (dom node)
	 * @param {HTMLElement} rootNode the node where to append the UI
	 * @returns {Object} the UI
	 */
	this.place = function place(rootNode) {
		
		var childNodes;
		
		rootNode.innerHTML = this.template;	
		
		// Add the dom nodes with data-connect attribute to this.connects
		childNodes = rootNode.querySelectorAll("[data-connect]");
		Array.prototype.forEach.call(childNodes, function (node) {
			this.connects[node.getAttribute("data-connect")] = node;
		}, this);
		
		return this.rootNode = rootNode;
	};
	
	
});