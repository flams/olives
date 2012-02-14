define("Olives/DomUtils", ["Tools"], function (Tools) {

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
		}
	
	};

});