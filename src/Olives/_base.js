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

	
});