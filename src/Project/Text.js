define("Olives/Text",
	
["Olives/OObject"],

/** 
* @class 
* Text is a simple paragraph with a unique property that shows the way UI work.
*/		
function Text(OObject) {
	
	function _Text() {
		
		this.template = "<p data-connect='content'></p>";
		
		this.onRender = function onRender() {
			this.model.watch("content", function (value) {
				this.connects["content"].innerHTML = value;
			}, this);
		};
		
	}
	
	return {
		create: function create() {
			var augmentedText = OObject.augment(_Text);
			return new augmentedText;
		}
	};

	
});