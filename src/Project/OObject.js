define("Olives/OObject", ["TinyStore", "StateMachine", "Tools"],
/** 
* @class 
* OObject is an abstract class that any UI can inherit from.
* It should provide code that is easy to reuse
*/
function OObject(TinyStore, StateMachine, Tools) {
	
	function OObject() {
		
		var render = function render(args) {
				var UI = args.UI;
				
				if (UI.template) {
					UI.dom = _rootNode;
					// In this function, the thisObject is the UI's prototype
					// UI is the UI that has OObject as prototype
					if (typeof UI.template == "string") {
						UI.dom.innerHTML = UI.template;
					} else if (UI.template instanceof HTMLElement) {
						UI.dom.appendChild(UI.template);
					}
					
					Tools.toArray(UI.dom.querySelectorAll("[data-connect]")).forEach(function (node) {
						UI.connects[node.getAttribute("data-connect")] = node;
					});
					
					UI.onRender && UI.onRender();
				} else {
					throw "UI.template must be set prior to render";
				}

			},
			place = function place(args) {
				var UI = args.UI;
				args.params && args.params.appendChild(UI.dom);
				UI.onPlace && UI.onPlace();
			},
			renderNPlace = function renderNPlace(args) {
				render(args);
				place(args);
			},
		
		_template = null,
		
		_rootNode = document.createElement("div"),
			
		_stateMachine = StateMachine.create("Init", {
			"Init": [["render", render, this, "Rendered"],
			         ["place", renderNPlace, this, "Rendered"]],
			"Rendered": [["place", place, this],
			             ["render", render, this]]
		});
		
		this.model = TinyStore.create();
		
		this.template = null;
		
		this.dom = null;
		
		this.connects = {};
		
		this.onRender = function onRender() {
			
		};
			
		this.action = function action(name, params) {
			_stateMachine.event(name, {UI: this,
				params: params});
		};
		
		this.onPlace = function onPlace() {
			
		};
		
	};
	
	return {
		augment: function augment(func) {
			func.prototype = new OObject;
			return func;
		},
		isAugmenting: function isAugmenting(module) {
			var proto = module.prototype ? module.prototype : Object.getPrototypeOf(module);
			return proto instanceof OObject;
		}
	};
	
});