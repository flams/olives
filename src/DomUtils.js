define("Olives/DomUtils", function () {

	return {
		getNodes : function getNodes(dom, query) {
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