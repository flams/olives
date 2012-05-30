/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

define("Olives/DomUtils", function () {

	return {
		/**
		 * Returns a NodeList including the given dom node,
		 * its childNodes and its siblingNodes
		 * @param {HTMLElement|SVGElement} dom the dom node to start with
		 * @param {String} query an optional CSS selector to narrow down the query
		 * @returns the list of nodes
		 */
		getNodes: function getNodes(dom, query) {
			if (this.isAcceptedType(dom)) {
				if (!dom.parentNode) {
					document.createDocumentFragment().appendChild(dom);
				}

				return dom.parentNode.querySelectorAll(query || "*");
			} else {
				return false;
			}
		},
	
		/**
		 * Get a domNode's dataset attribute. If dataset doesn't exist (IE) 
		 * then the domNode is looped through to collect them.
		 * @param {HTMLElement|SVGElement} dom
		 * @returns {Object} dataset
		 */
		getDataset: function getDataset(dom) {
			var i=0,
				l, 
				dataset={},
				split,
				join;
			
			if (this.isAcceptedType(dom)) {
				if (dom.hasOwnProperty("dataset")) {
					return dom.dataset;
				} else {
					for (l=dom.attributes.length;i<l;i++) {
						split = dom.attributes[i].name.split("-");
						if (split.shift() == "data") {
							dataset[join = split.join("-")] = dom.getAttribute("data-"+join);
						}
					}
					return dataset;
				}
				
			} else {
				return false;
			}
		},
		
		isAcceptedType: function isAcceptedType(type) {
			if (type instanceof HTMLElement ||
				type instanceof SVGElement) {
				return true;
			} else {
				return false;
			}
		}
	
	};

});
