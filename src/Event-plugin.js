/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

define("Olives/Event-plugin", function () {
	
	return function EventPluginConstructor($parent, $isMobile) {

		var _parent = null,
			_map = {
				"mousedown" : "touchstart",
				"mouseup" : "touchend",
				"mousemove" : "touchmove"
			},
			_isMobile = $isMobile===true ? $isMobile : false;

		this.listen = function(node, event, listener, useCapture) {
			node.addEventListener(event, function(e) { 
				parent[listener].call(parent,e, node);
			}, (useCapture == "true"));
		};

		/*
		 * Get the parent object. 
		 * @return {Object} the parent object
		 */
		this.parent = function(){
			return _parent;
		};	

		/*
		 * Set the parent object.
		 * The parent object is an object which the functions are called by node listeners.
		 * @param {Object} the parent object
		 * @return true if object has been set
		 */
		this.setParent = function(parent){
			if(parent instanceof Object){
				_parent = parent;
				return true;
			}
			return false;
		};

		this.map = function(key){
			var value = _map[key];
			return value && _isMobile ? value : key;
		};

		this.setMap = function(key, value){
			if(typeof key =="string" && typeof value =="string"){
				_map[key] = value;
				return true;
			}
			return false;
		};

		//init
		this.setParent($parent);
	};
	
});
