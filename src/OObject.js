define("Olives/OObject", ["StateMachine", "Store", "Olives/Plugins", "Olives/DomUtils", "Tools"],
/** 
* @class 
* OObject is an abstract class that any UI can inherit from.
* It should provide code that is easy to reuse
* @requires StateMachine
*/
function OObject(StateMachine, Store, Plugins, DomUtils, Tools) {
	
	return function OObjectConstructor(otherStore) {
		
		/**
		 * This function creates the dom of the UI from it's template
		 * It then queries the dom for data-model to list them into this.connects
		 * It can't be executed if the template is not set
		 * @private
		 */
		var render = function render(args) {
			var UI = args.UI;
			
			// If the template is set
			if (UI.template) {
				// In this function, the thisObject is the UI's prototype
				// UI is the UI that has OObject as prototype
				if (typeof UI.template == "string") {
					// Let the browser do the parsing, can't be faster & easier.
					UI.dom.innerHTML = UI.template;
				} else if (UI.template instanceof HTMLElement) {
					// If it's already an HTML element
					UI.dom.appendChild(UI.template);
				}
				
				// Let's now apply the plugins
				UI.plugins.apply(UI.dom);

				// This function is empty and can be overridden by the user.
				// It tells him that the UI is rendered
				UI.onRender && UI.onRender();
			} else {
				// An explicit message I hope
				throw Error("UI.template must be set prior to render");
			}
		},
		
		/**
		 * This function appends the dom tree to the given dom node.
		 * This dom node should be somewhere in the dom of the application
		 * @private
		 */
		place = function place(args) {
			var UI = args.UI;

			// The following was made to avoid adding unwanted nodes in the dom.
			// Adding a parent div could have eased it but it slows down the interface
			// (adding nodes is never a good thing) and it's unexpected by the developer.
			if (args.params) {
				// Get's all childNodes to append them to the new node
				Tools.toArray(UI.dom.childNodes).forEach(function (node) {
					args.params.appendChild(node);
				});
				// The new node is saved
				UI.dom = args.params;
			}
			
			UI.onPlace && UI.onPlace();
		},
		
		/**
		 * Does rendering & placing in one function
		 * @private
		 */
		renderNPlace = function renderNPlace(args) {
			render(args);
			place(args);
		},
			
		/**
		 * The UI's stateMachine.
		 * Much better than if(stuff) do(stuff) else if (!stuff and stuff but not stouff) do (otherstuff)
		 * Please open an issue if you want to propose a better one
		 * @private
		 */
		_stateMachine = new StateMachine("Init", {
			"Init": [["render", render, this, "Rendered"],
			         ["place", renderNPlace, this, "Rendered"]],
			"Rendered": [["place", place, this],
			             ["render", render, this]]
		});
		
		/**
		 * The UI's Store
		 * It has set/get/del/has/watch/unwatch methods
		 * @see Emily's doc for more info on how it works.
		 */
		this.model = otherStore instanceof Store ? otherStore : new Store;
		
		/**
		 * The module that will manage the plugins for this UI
		 * @see Olives/Plugins' doc for more info on how it works.
		 */
		this.plugins = new Plugins();
		
		/**
		 * Describes the template, can either be like "&lt;p&gt;&lt;/p&gt;" or HTMLElements
		 * @type string or HTMLElement
		 */
		this.template = null;
		
		/**
		 * This will hold the dom nodes built from the template.
		 */
		this.dom = document.createElement("div");
		
		/**
		 * This function can be overridden. 
		 * It's called when the rendering is done.
		 */
		this.onRender = function onRender() {
			
		};
			
		/**
		 * Action triggers a state change, such as "place" or "render.
		 * Watch the life cycle documentation for more info.
		 * @param {String} name the name of the action
		 * @param {Object} params the parameters to pass to the actions
		 */
		this.action = function action(name, params) {
			_stateMachine.event(name, {UI: this,
				params: params});
		};
		
		/**
		 * This function can be overridden. 
		 * It's called when the placing is done.
		 */
		this.onPlace = function onPlace() {
			
		};
		
	};
	
});