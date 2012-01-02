define("Olives/List",
		
["Olives/OObject", "TinyStore"], 

function (OObject, TinyStore) {
	
	function _List(array) {

		this.model.reset(array);
		
		this.template = "<ul data-connect='root'></ul>";
		
		this.onRender = function onRender() {
			this.model.loop(function (item, idx) {
				var node = this.itemRenderer(item);
				this.connects.root.appendChild(node);
				this.model.watch("updated", function (idx, newItem) {
					var hop = this.itemRenderer(newItem);
					this.connects.root.replaceChild(hop, node);
				}, this);
			}, this);
			this.model.watch("added", function (idx, newItem) {
				var hop = this.itemRenderer(newItem);
				this.connects.root.appendChild(hop);
			}, this);
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