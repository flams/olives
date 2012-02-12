define("Olives/DomUtils", function () {

	return {
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