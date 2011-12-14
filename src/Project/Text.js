define("Olives/Text",
	
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
	};

	
});