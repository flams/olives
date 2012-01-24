define("Olives/Model-plugin", 
		
["Store", "Observable", "Tools"],
		
/**
 * @class
 * This plugin links dom nodes to a model
 * @requires Store, Observable
 */
function ModelPlugin(Store, Observable, Tools) {
	
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
		_observable = new Observable(),
		
		/**
		 * The function to put some content into a dom node
		 * @private
		 */
		setInnerHTML = function setInnerHTML(dom, html) {
			dom.innerHTML = html;
		};
		
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
		 * ...
		 * @param {HTMLElement} node the dom node to apply toList to
		 */
		this.toList = function toList(node) {
			var itemRenderer = node.childNodes[0],
            	domFragment = document.createDocumentFragment();

			
			if (itemRenderer) {

	            _model.loop(function (value, idx) {
	                    var newNode = itemRenderer.cloneNode(true);
	                    if (newNode.childNodes) {
	                    	Tools.loop(newNode.childNodes, function (child) {
	                    		if (child.dataset["model"]) {
	                    			child.dataset["model.id"] = idx;
	                    		}
	                    	});
	                    }
	                    if(newNode.dataset["model"]) {
	                    	newNode.dataset["model.id"] = idx;
	                    }
	                    domFragment.appendChild(newNode);
	            });

	            node.replaceChild(domFragment, itemRenderer);
            
			}
            
            _model.watch("added", function (idx, value) {
                    var newNode = itemRenderer.cloneNode(true);
                    if (newNode.childNodes) {
                    	Tools.loop(newNode.childNodes, function (child) {
                    		if (child.dataset["model"]) {
                    			child.dataset["model.id"] = idx;
                    		}
                    	});
                    }
                    if(newNode.dataset["model"]) {
                    	newNode.dataset["model.id"] = idx;
                    }
                    node.insertBefore(newNode, node.childNodes[idx]);
            });
            
            _model.watch("deleted", function (idx) {
                    // The document.childNodes indexes need to be preserved,
                    // so I replace the nodes with empty ones.
                    node.replaceChild(document.createTextNode(""), node.childNodes[idx]);
            });

         };
		
		
		/**
		 * Attach a model's value to a dom node so it also gets updated on value's changes
		 * @param {HTMLElement} node the dom node to apply the plugin to
		 * @param {String} name the name of the model's value to attach it to
		 * @returns
		 */
		this.toText = function toText(node, name) {
			// Leave the dom intact of no value
			if (_model.has(name)) {
				setInnerHTML(node, _model.get(name));
			}
			// Watch for modifications
			_observable.watch(name, function (value) {
				setInnerHTML(node, value);
			});
		};
		
		this.item = function item(node, value) {
			var id = node.dataset["model.id"];
			// Leave the dom intact of no value
			if (_model.has(id)) {
				setInnerHTML(node, _model.get(id));
			}
			_observable.watch(id, function (value) {
				setInnerHTML(node, value);
			});
		};
	
		// Inits the model
		this.setModel($model);
		
		
	};
	
});