define("Olives/Model-plugin", 
		
["Store", "Observable"],
		
/**
 * @class
 * This plugin links dom nodes to a model
 * @requires Store, Observable
 */
function ModelPlugin(Store, Observable) {
	
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
		 * 
		 * @returns
		 */
		this.toList = function toList() {
			
		};
		
		/**
		 * Attach a model's value to a dom node so it also gets updated on value's changes
		 * @param {HTMLElement} dom the dom node to apply the plugin to
		 * @param {String} name the name of the model's value to attach it to
		 * @returns
		 */
		this.toText = function toText(dom, name) {
			// Leave the dom intact of no value
			if (_model.has(name)) {
				setInnerHTML(dom, _model.get(name));
			}
			// Watch for modifications
			_observable.watch(name, function (value) {
				setInnerHTML(dom, value);
			});
		};
	
		// Inits the model
		this.setModel($model);
		
		
	};
	
});