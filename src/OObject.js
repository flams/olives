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
			
			// The place where the template will be created
			// is either the currentPlace where the node is placed
			// or a temporary div
			var baseNode = _currentPlace || document.createElement("div");
			
			// If the template is set
			if (UI.template) {
				// In this function, the thisObject is the UI's prototype
				// UI is the UI that has OObject as prototype
				if (typeof UI.template == "string") {
					// Let the browser do the parsing, can't be faster & easier.
					baseNode.innerHTML = UI.template.trim();
				} else if (UI.template instanceof HTMLElement) {
					// If it's already an HTML element
					baseNode.appendChild(UI.template);
				}
				
				// The UI must be placed in a unique dom node
				// If not, there can't be multiple UIs placed in the same parentNode
				// as it wouldn't be possible to know which node would belong to which UI
				// This is probably a DOM limitation.
				if (baseNode.childNodes.length > 1) {
					throw Error("UI.template should have only one parent node");
				} else {
					UI.dom = baseNode.childNodes[0];
				}
				
				UI.alive(UI.dom);

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
				// Also save the new place, so next renderings
				// will be made inside it
				_currentPlace = place;
			}
		},
		
		/**
		 * Does rendering & placing in one function
		 * @private
		 */
		renderNPlace = function renderNPlace(UI, dom) {
			render(UI);
			place(UI, dom);
		},
		
		/**
		 * This stores the current place
		 * If this is set, this is the place where new templates
		 * will be appended
		 * @private
		 */
		_currentPlace = null, 
		
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
		
		/**
		 * Place the UI in a given dom node
		 * @param {HTMLElement} node the node on which to append the UI
		 */
		this.place = function place(node) {
			_stateMachine.event("place", this, node);
		};
		
		/**
		 * Renders the template to dom nodes and applies the plugins on it
		 * It requires the template to be set first
		 */
		this.render = function render() {
			_stateMachine.event("render", this);
		};
		
		/**
		 * Applies this UI's plugins to the given dom node,
		 * kind of making it 'alive'
		 * @param {HTMLElement} node the dom to apply the plugins to
		 * @returns false if wrong param
		 */
		this.alive = function alive(dom) {
			if (dom instanceof HTMLElement) {
				this.plugins.apply(dom);
				return true;
			} else {
				return false;
			}
			
		};
		
	};
	
});