define("Olives/OObject", ["TinyStore"],
/** 
* @class 
* _base is an abstract class that every UI can inherit from.
* It should provide code that is easy to reuse
*/
function OObject(Tinystore) {
	
	return {
		/**
		 * The model of the UI is a TinyStore
		 * @type object
		 */
		model: Tinystore.create()
	};
	
});