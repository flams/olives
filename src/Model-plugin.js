/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/Model-plugin", 
		
["Store", "Observable", "Tools", "Olives/DomUtils"],
		
/**
 * @class
 * This plugin links dom nodes to a model
 * @requires Store, Observable
 */
function ModelPlugin(Store, Observable, Tools, DomUtils) {
	
	return function ModelPluginConstructor($model, $bindings) {
		
		/**
		 * The model to watch
		 * @private
		 */
		var _model = null,
		
		_bindings = {};
		
		/**
		 * The observers handlers
		 * for debugging only
		 * @private
		 */
		this.observers = {};
		
		/**
		 * Define the model to watch for
		 * @param {Store} model the model to watch for changes
		 * @returns {Boolean} true if the model was set
		 */
		this.setModel = function setModel(model) {
			if (model instanceof Store) {
				// Set the model
				_model = model;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the store that is watched for
		 * for debugging only
		 * @private
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
		this.ItemRenderer = function ItemRenderer($plugins, $rootNode) {
			
			var _node = null,
			_plugins = null,
			_rootNode = null;
			
			/**
			 * Set the duplicated node
			 * @private
			 */
			this.setRenderer = function setRenderer(node) {
				_node = node;
				return true;
			};
			
			/**
			 * @private
			 * @returns the node that is duplicated
			 */
			this.getRenderer = function getRenderer() {
				return _node;
			};
			
			this.setRootNode = function setRootNode(rootNode) {
				var renderer;
				if (rootNode instanceof HTMLElement) {
					_rootNode = rootNode;
					renderer = _rootNode.querySelector("*");
					this.setRenderer(renderer);
					_rootNode.removeChild(renderer);
					return true;
				} else {
					return false;
				}
			};
			
			this.getRootNode = function getRootNode() {
				return _rootNode;
			};
			
			this.setPlugins = function setPlugins(plugins) {
				_plugins = plugins;
				return true;
			};
			
			this.getPlugins = function getPlugins() {
				return _plugins;
			};
			
			this.items = new Store([]);
			
			this.pushItems = function pushItems(nb) {
				for (var i=0; i<nb; i++) {
					_rootNode.appendChild(this.create(i));
				}
				return true;
			};
			
			this.popItems = function popItems() {
				
			};
			
			this.shiftItems = function shiftItems() {
				
			};
			
			this.unshiftItems = function shiftItems() {
				
			};
			
			/**
			 * create a new node
			 * @private
			 * @param id
			 * @param pluginName
			 * @returns the associated node
			 */
			this.create = function create(id) {
				if (_model.has(id)) {
					var newNode = _node.cloneNode(true),
					nodes = DomUtils.getNodes(newNode);

					Tools.toArray(nodes).forEach(function (child) {
	            		child.dataset[_plugins.name+"_id"] = id;
					});
					
					this.items.set(id, newNode);
					_plugins.apply(newNode);
					return newNode;
				}
			};
			
			this.remove = function remove() {
				
			};
			
			this.setPlugins($plugins);
			this.setRootNode($rootNode);
		};
		
		/**
		 * Expands the inner dom nodes of a given dom node, filling it with model's values
		 * @param {HTMLElement} node the dom node to apply foreach to
		 */
		this.foreach = function foreach(node) {
			var itemRenderer = new this.ItemRenderer(this.plugins, node);
			
			itemRenderer.pushItems(_model.getNbItems());
            
            _model.watch("added", function (idx, value) {
                node.insertBefore(this.plugins.apply(itemRenderer.create(idx)), node.childNodes[idx]);
            }, this);
            
            _model.watch("deleted", function (idx) {
                node.removeChild(node.childNodes[idx]);
                this.observers[idx].forEach(function (handler) {
                	_model.unwatchValue(handler);
                }, this);
                delete this.observers[idx];
            },this);
         };
		
		/**
		 * Both ways binding between a dom node attributes and the model
		 * @param {HTMLElement} node the dom node to apply the plugin to
		 * @param {String} name the name of the property to look for in the model's value
		 * @returns
		 */
		this.bind = function bind(node, property, name) {

			// Name can be unset if the value of a row is plain text
			name = name || "";

			// In case of an array-like model the id is the index of the model's item to look for.
			// The _id is added by the foreach function
			var id = node.dataset[this.plugins.name+"_id"],
		
			// Else, it is the first element of the following
			split = name.split("."),
			
			// So the index of the model is either id or the first element of split
			modelIdx = id || split.shift(),
			
			// And the name of the property to look for in the value is
			prop = id ? name : split.join("."),
			
			// Get the model's value
			get =  Tools.getNestedProperty(_model.get(modelIdx), prop);

			// 0 and false are acceptable falsy values
			if (get || get === 0 || get === false) {
				// If the binding hasn't been overriden
				if (!this.execBinding(node, property, get)) {
					// Execute the default one which is a simple assignation
					node[property] = get;
				}
			}
			
			// Only watch for changes (double way data binding) if the binding
			// has not been redefined
			if (!this.hasBinding(property)) {
				node.addEventListener("change", function (event) {
					if (prop) {
						var temp = _model.get(modelIdx);
						Tools.setNestedProperty(temp, name, node[property]);
						_model.set(modelIdx, temp);	
					} else {
						_model.set(modelIdx, node[property]);
					}
				}, true);

			}
			
			// Watch for changes
			this.observers[modelIdx] = this.observers[modelIdx] || [];
			this.observers[modelIdx].push(_model.watchValue(modelIdx, function (value) {
				if (!this.execBinding(node, property, Tools.getNestedProperty(value, prop))) {
					node[property] = Tools.getNestedProperty(value, prop);
				}
			}, this));

		};
		
		/**
		 * Set the node's value into the model, the name is the model's property
		 * @private
		 * @param {HTMLElement} node
		 * @returns true if the property is added
		 */
		this.set = function set(node) {
			if (node instanceof HTMLElement && node.name) {
				_model.set(node.name, node.value);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Prevents the submit and set the model with all form's inputs
		 * @param {HTMLFormElement} form
		 * @returns true if valid form
		 */
		this.form = function form(form) {
			if (form && form.nodeName == "FORM") {
				var that = this;
				form.addEventListener("submit", function (event) {
					Tools.toArray(form.querySelectorAll("[name]")).forEach(that.set, that);
					event.preventDefault();
				}, true);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Add a new way to handle a binding
		 * @param {String} name of the binding
		 * @param {Function} binding the function to handle the binding
		 * @returns
		 */
		this.addBinding = function addBinding(name, binding) {
			if (name && typeof name == "string" && typeof binding == "function") {
				_bindings[name] = binding;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Execute a binding
		 * Only used by the plugin
		 * @private
		 * @param {HTMLElement} node the dom node on which to execute the binding
		 * @param {String} name the name of the binding
		 * @param {Any type} value the value to pass to the function
		 * @returns
		 */
		this.execBinding = function execBinding(node, name, value) {
			if (this.hasBinding(name)) {
				_bindings[name].call(node, value);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Check if the binding exists
		 * @private
		 * @param {String} name the name of the binding
		 * @returns
		 */
		this.hasBinding = function hasBinding(name) {
			return _bindings.hasOwnProperty(name);
		};
		
		/**
		 * Get a binding
		 * For debugging only
		 * @private
		 * @param {String} name the name of the binding
		 * @returns
		 */
		this.getBinding = function getBinding(name) {
			return _bindings[name];
		};
		
		/**
		 * Add multiple binding at once
		 * @param {Object} list the list of bindings to add
		 * @returns
		 */
		this.addBindings = function addBindings(list) {
			return Tools.loop(list, function (binding, name) {
				this.addBinding(name, binding);
			}, this);
		};
	
		// Inits the model
		this.setModel($model);
		// Inits bindings
		this.addBindings($bindings);
		
		
	};
	
});