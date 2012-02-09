define("Olives/Model-plugin", 
		
["Store", "Observable", "Tools", "Olives/DomUtils"],
		
/**
 * @class
 * This plugin links dom nodes to a model
 * @requires Store, Observable
 */
function ModelPlugin(Store, Observable, Tools, DomUtils) {
	
	return function ModelPluginConstructor($model) {
		
		/**
		 * The model to watch
		 * @private
		 */
		var _model = null,
		
		/**
		 * An observable that apdapts to model's observable
		 * @private
		 */
		_observable = new Observable();
		
		/**
		 * Define the model to watch for
		 * @param {Store} model the model to watch for changes
		 * @returns {Boolean} true if the model was set
		 */
		this.setModel = function setModel(model) {
			if (model instanceof Store) {
				// Set the model
				_model = model;
				// Also watch for value modification
				_model.watch("updated", function (name, value) {
					_observable.notify(name, value);
				});
				_model.watch("added", function (name, value) {
					_observable.notify(name, value);
				});
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the store that is watched for
		 * @returns the Store
		 */
		this.getModel = function getModel() {
			return _model;
		};
		
		/**
		 * The item renderer defines a dom node that can be duplicated
		 * It is made available for debugging purpose, don't use it
		 * @private
		 */
		this.ItemRenderer = function ItemRenderer(item) {
			
			var _node = null;
			
			/**
			 * Set the duplicated node
			 * @private
			 */
			this.set = function set(node) {
				_node = node;
				return true;
			};
			
			/**
			 * @private
			 * @returns the node that is duplicated
			 */
			this.get = function get() {
				return _node;
			};
			
			/**
			 * Associate the duplicated node to an item in the model
			 * @private
			 * @param id
			 * @param pluginName
			 * @returns the associated node
			 */
			this.associate = function associate(id, pluginName, hey) {
				var newNode = _node.cloneNode(true);
				var nodes = DomUtils.getNodes(newNode, "[data-" + pluginName + "]");

				
				Tools.loop(nodes, function (child) {
						// Emily's Tools.loop returns me 0 on empty NodeList
						// Must fix this in the function instead of here
            			child && (child.dataset[pluginName+".id"] = id);
				});
				return newNode;
			};
			
			this.set(item);			
		};
		
		/**
		 * Expands the inner dom nodes of a given dom node, filling it with model's values
		 * @param {HTMLElement} node the dom node to apply toList to
		 */
		this.toList = function toList(node) {
			var domFragment,
				itemRenderer = new this.ItemRenderer(node.childNodes[0]);

	
			domFragment = document.createDocumentFragment();
            _model.loop(function (value, idx) {
                    domFragment.appendChild(this.plugins.apply(itemRenderer.associate(idx, this.plugins.name)));
            }, this);
            

	         node.replaceChild(domFragment, node.childNodes[0]);
            
            _model.watch("added", function (idx, value) {
                node.insertBefore(this.plugins.apply(itemRenderer.associate(idx, this.plugins.name)), node.childNodes[idx]);
            }, this);
            
            _model.watch("deleted", function (idx) {
                    // The document.childNodes indexes need to be preserved,
                    // so I replace the nodes with empty ones.
                    node.replaceChild(document.createTextNode(""), node.childNodes[idx]);
            });


         };
		
		/**
		 * Attach a model's value to a dom node so it also gets updated on value's changes
		 * @param {HTMLElement} node the dom node to apply the plugin to
		 * @param {String} name the name of the property to look for in the model's value
		 * @returns
		 */
		this.toText = function toText(node, name) {
			
			// Name can be unset if the value of a row is plain text
			name = name || "";

			// In case of an array-like model the id is the index of the model's item to look for.
			// The .id is added by the toList function
			var id = node.dataset[this.plugins.name+".id"],
			
			// Else, it is the first element of the following
			split = name.split("."),
			
			// So the index of the model is either id or the first element of split
			modelIdx = id || split.shift(),
			
			// And the name of the property to look for in the value is
			prop = id ? name : split.join("."),
			
			// Get the model's value
			get =  Tools.getObjectsProperty(_model.get(modelIdx), prop);
			
			// If the value is falsy, the dom shouldn't be touched
			if (get) {
				node.innerHTML = get;
			}
			
			// Watch for changes
			_observable.watch(modelIdx, function (value) {
					node.innerHTML = Tools.getObjectsProperty(value, prop);
			});
		};
		
		this.set = function set(node) {
			if (node instanceof HTMLElement && node.name) {
				_model.set(node.name, node.value);
				node.addEventListener("change", function () {
					_model.set(node.name, node.value);
				}, true);
				return true;
			} else {
				return false;
			}
		};
		
		this.form = function form(form) {
			if (form && form.nodeName == "FORM") {
				Tools.loop(form.querySelectorAll("[name]"), this.set, this);
				return true;
			} else {
				return false;
			}
		};
	
		// Inits the model
		this.setModel($model);
		
		
	};
	
});