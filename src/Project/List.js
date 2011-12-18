define("Olives/List",
		
["Olives/OObject"], 

function (OObject) {
	
	function _List(array) {
		
		this.model = array || [];
		
		this.template = "<ul data-connect='root'></ul>";
		
		this.onRender = function onRender() {
			this.model.forEach(function (item) {
				var li = document.createElement("li");
				li.innerHTML = item;
				this.connects.root.appendChild(li);
			}, this);
		};
		
	}
	
	return {
		create: function create(array) {
			var augmentedList = OObject.augment(_List);
			return new augmentedList(array);
		}
	};
	
});