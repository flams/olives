define("Olives/List",
		
["Olives/OObject", "TinyStore"], 

function (OObject, TinyStore) {
	
	function _List(array) {

		this.model.reset(array);
		
		this.template = "<ul data-connect='root'></ul>";

		this.onRender = function onRender() {
			this.model.loop(function (idx, item) {
				this.placeItem(item, idx);
			}, this);
			this.model.watch("added", this.placeItem, this);
			this.model.watch("updated", this.placeItem, this);
			this.model.watch("deleted", this.placeItem, this);
		};
		

		
		this.placeItem = function (idx, item) {
			var parent = this.connects.root,
			node = item ? this.itemRenderer(item) : document.createTextNode("");

			if (parent.childNodes[idx]) {
				parent.replaceChild(node, parent.childNodes[idx]);	
			} else {
				parent.appendChild(node);
			}
		};
		
		this.itemRenderer = function itemRenderer(item) {
			var li = document.createElement("li");
			li.innerHTML = item;
			return li;
		};
		
	}
	
	return {
		create: function create(array) {
			var augmentedList = OObject.augment(_List);
			return new augmentedList(array);
		}
	};
	
});