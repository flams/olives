/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

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
		var render = function render(UI) {
			var convertNode = document.createElement("div");
			
			// If the template is set
			if (UI.template) {
				// In this function, the thisObject is the UI's prototype
				// UI is the UI that has OObject as prototype
				if (typeof UI.template == "string") {
					// Let the browser do the parsing, can't be faster & easier.
					convertNode.innerHTML = UI.template.trim();
				} else if (UI.template instanceof HTMLElement) {
					// If it's already an HTML element
					convertNode.appendChild(UI.template);
				}
				
				if (convertNode.childNodes.length > 1) {
					throw Error("UI.template should have only one parent node");
				} else {
					UI.dom = convertNode.childNodes[0];
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
		place = function place(UI, place) {
			if (place) {
				place.appendChild(UI.dom);
			}
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
		this.dom = null;
		
		this.place = function place(params) {
			_stateMachine.event("place", this, node);
		};
		
		this.render = function render() {
			_stateMachine.event("render", this);
		};
		
		/**

		 */
		this.alive = function alive(dom) {

		};
		
	};
	
});