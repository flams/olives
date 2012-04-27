/**
 * @license Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

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
		},
	
		getDataset: function getDataset(dom) {
			var i=0,
				l, 
				dataset={},
				split,
				join;
			
			if (dom instanceof HTMLElement) {
				for (l=dom.attributes.length;i<l;i++) {
					split = dom.attributes[i].name.split("-");
					if (split.shift() == "data") {
						dataset[join = split.join("-")] = dom.getAttribute("data-"+join);
					}
				}
				return dataset;
			} else {
				return false;
			}
		}
	
	};

});