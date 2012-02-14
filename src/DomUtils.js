define("Olives/DomUtils", function () {

	return {
		/**
		 * Returns a NodeList 
		 * @param dom
		 * @param query
		 * @returns
		 */
		getNodes: function getNodes(dom, query) {
			if (dom instanceof HTMLElement) {
				if (!dom.parentNode) {
					document.createDocumentFragment().appendChild(dom);
				}

				return dom.parentNode.querySelectorAll(query || "*");
			} else {
				return false;
			}
		},
		
		/**
		 * Loop over a node list. 
		 * A node list has to be looped over just like an array 
		 * But it doesn't have arrays functions.
		 * @param {NodeList} dom the node list to loop over
		 * @param {Function} func the function to execute for each item
		 * @param {Object} scope the scope in which to execute the function
		 * @returns true if dom is a NodeList and func is a function
		 */
		loopNodes: function loopNodes(dom, func, scope) {
			if (dom instanceof NodeList && func instanceof Function) {
				Array.prototype.slice.call(dom, 0).forEach(func, scope);
				return true;
			} else {
				return false;
			}


		}
	
	};

});