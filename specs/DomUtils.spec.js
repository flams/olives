/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

require(["Olives/DomUtils"], function (DomUtils) {
	
	describe("DomUtilsGetNodes", function () {
	
		it("should be a function", function () {
			expect(DomUtils.getNodes).toBeInstanceOf(Function);
		});
		
		it("should only accept a dom node", function () {
			expect(DomUtils.getNodes()).toEqual(false);
			expect(DomUtils.getNodes({})).toEqual(false);
			expect(DomUtils.getNodes(document.createElement("div"))).toBeTruthy();
		});
		
		it("should return the list of dom nodes", function () {
			var dom = document.createElement("div"),
				ul = document.createElement("ul"),
				nodes;
			
			dom.appendChild(document.createElement("p"));
			dom.appendChild(ul);
			ul.appendChild(document.createElement("li"));
			ul.appendChild(document.createElement("li"));
			
			nodes = DomUtils.getNodes(ul);
			expect(nodes.length).toEqual(4);
			expect(nodes[0]).toBeInstanceOf(HTMLParagraphElement);
			expect(nodes[1]).toBeInstanceOf(HTMLUListElement);
			expect(nodes[2]).toBeInstanceOf(HTMLLIElement);
			expect(nodes[3]).toBeInstanceOf(HTMLLIElement);
		});
		
		it("should allow for specifying a query string", function () {
			var dom = document.createElement("div"),
				ul = document.createElement("ul"),
				nodes;
			
			dom.appendChild(document.createElement("p"));
			dom.appendChild(ul);
			ul.appendChild(document.createElement("li"));
			ul.appendChild(document.createElement("li"));
			
			nodes = DomUtils.getNodes(dom, "div");
			expect(nodes.length).toEqual(1);
			expect(nodes[0]).toBeInstanceOf(HTMLDivElement);
			
			nodes = DomUtils.getNodes(dom, "li");
			expect(nodes.length).toEqual(2);
			expect(nodes[0]).toBeInstanceOf(HTMLLIElement);
			expect(nodes[1]).toBeInstanceOf(HTMLLIElement);
		});
		
		it("shouldn't break the parent-child relation if any", function () {
			var parent = document.createElement("div"),
				child = document.createElement("div");
			
			parent.appendChild(child);
			DomUtils.getNodes(child);
			expect(child.parentNode).toBe(parent);
		});
		
		
	});
	
});