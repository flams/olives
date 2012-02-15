define("Olives/DomUtils", ["Tools"], function (Tools) {

	return {
		/**
		 * Returns a NodeList including the given dom node,
		 * its childNodes and its siblingNodes
		 * @param {HTMLElement} dom the dom node to start with
		 * @param {String} query an optional CSS selector to narrow down the query
		 * @returns the list of nodes
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
		}
	
	};

});