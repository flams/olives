// The whole application is described in this module
// But we can imagine defining parts of it separately and creating a bigger UI
// that would include them. We'd have reusable code.
// A bit overkill here
require(["Olives/LocalStore", "Olives/OObject", "Olives/Model-plugin", "Olives/Event-plugin"],

function (Store, OObject, ModelPlugin, EventPlugin) {
	// The Todo App constructor
	function TodosConstructor() {

		 // A store to save the statistics
		var stats = new Store({
			nbItems: 0,
			completed: 0,
			completedWord: "item",
			nbItemsWord: "item"
		});

		// Synchronize the store with localStorage
		stats.sync("todos-stats-emily");

	
		// Add a task
		this.addTask = function (event, node) {
			if (event.keyIdentifier == "Enter") {
				this.model.alter("push", {
					name: node.value,
					completed: false
				});
				node.value = "";
			}
		};
		
		// Clear all completed tasks
		// We don't rely on the checkboxes but on the values in the store.
		this.clear = function () {
			// Get all completed tasks, sort their indexes and reverse them,
			// unpiling them won't modify the remaining completed task's indexes
			// Might need to add a function in the store to remove multiple indexes.
			this.getCompleted().sort().reverse().forEach(this.model.del, this.model);
		};

		// Calculate the number of takses and update the statistics store
		this.setItemsLeft = function () {
			this.setInfo("nbItems", this.model.getNbItems());
		};

		// Calculate the number of completed tasks and update the statistics store
		this.setCompleted = function () {
			this.setInfo("completed", this.getCompleted().length);
		};
		
		// Returns the number of completed tasks
		this.getCompleted = function () {
			var completed = [];
			this.model.loop(function (value, idx) {
				if (value.completed) {
					completed.push(idx);
				}
			});
			return completed;
		};
	
		// Update the store and set "items" accordingly
		this.setInfo = function setInfo(name, length) {
			stats.set(name, length);
			stats.set(name+"Word", length > 1 ? "items" : "item");
		};
		
		// Watch for add/del/update to update the statistics
		this.model.watch("added", this.setItemsLeft, this);
		this.model.watch("deleted", this.setItemsLeft, this);
		this.model.watch("deleted", this.setCompleted, this);
		this.model.watch("updated", this.setCompleted, this);
		// Synchronize the store with localStorage
		this.model.sync("todos-tasks-emily");
		
		// Add the plugins.
		this.plugins.addAll({
			// ModelPlugin binds dom nodes with the model. The plumbing
			"stats": new ModelPlugin(stats),
			"model": new ModelPlugin(this.model, {
				// toggleClass in a kind of plugin to ModelPlugin
				// Its treated like a property but you can define what you want to do
				toggleClass: function toggleClass(value) {
					value ? this.classList.add("done") : this.classList.remove("done");
				}
			}),
			"event": new EventPlugin(this)
		});
	}

	
	// Make the application inherit from OObject
	// The oobject brings up a statemachine, a store, and some UI logic
	TodosConstructor.prototype = new OObject(new Store([]));
	// Apply the plugins to .content
	(new TodosConstructor).alive(document.querySelector(".content"));


});