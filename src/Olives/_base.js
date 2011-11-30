Olives.define("_base",
/** 
* @class 
* _base is an abstract class that every UI can inherit from.
* It should provide code that is easy to reuse
*/
function _base(API) {
	
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
	 * Render the UI at a given place (dom node)
	 * @param {HTMLElement} node the node where to append the UI
	 * @returns {Object} the UI
	 */
	this.place = function place(node) {
		
		node.innerHTML = this.template;
		// Watch out for memleaks
		// Get this out in a function when other values will have to be bound to model
		// Make the default innerHTML attribution overridable 
		// still Loadss of stuff to do but it's a cool start
		Array.prototype.forEach.call(node.querySelectorAll("*[data-bind]"), function (tag) {
			this.model.set(tag.getAttribute("data-bind"), tag.innerHTML);
			this.model.watch(tag.getAttribute("data-bind"), function (value) {
				tag.innerHTML = value;
			});
		}, this);
		
		
		return this;
	};
});