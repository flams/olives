/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
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
	
	describe("DomUtilsGetDataset", function () {
		
		var dom;
		
		beforeEach(function () {
			dom = document.createElement("div");
			dom.setAttribute("data-plugin1", "name1");
			dom.setAttribute("data-plugin2", "name2");
		});
		
		it("should be a function", function () {
			expect(DomUtils.getDataset).toBeInstanceOf(Function);
		});
		
		it("should only work with dom nodes", function () {
			expect(DomUtils.getDataset()).toEqual(false);
			expect(DomUtils.getDataset({})).toEqual(false);
			expect(DomUtils.getDataset(dom)).toBeTruthy();
		});
		
		it("should return an object similar to a dataset", function () {
			var dataset = DomUtils.getDataset(dom);
			expect(dataset).toBeInstanceOf(Object);
			expect(dataset["plugin1"]).toEqual("name1");
			expect(dataset["plugin2"]).toEqual("name2");
		});
		
		it("should exactly return the dataset if the browser supports it", function () {
			if (dom.dataset) {
				dom.dataset["plugin1"] = "browser supports dataset";
				var dataset = DomUtils.getDataset(dom);
				expect(dataset["plugin1"]).toEqual("browser supports dataset");
			}
		});
		
	});
	
	describe("DomUtilsAcceptedElements", function () {
		
		var acceptedElements = [document.createElement("div"), 
		                        document.createElementNS("http://www.w3.org/2000/svg", "ellipse")];
		
		it("should be a function", function () {
			expect(DomUtils.isAcceptedType).toBeInstanceOf(Function);
		});
		
		it("should return true if given an accepted type", function () {
			acceptedElements.forEach(function (type) {
				expect(DomUtils.isAcceptedType(type)).toEqual(true);
			});
		});
		
		it("should return false if not an accepted type", function () {
			expect(DomUtils.isAcceptedType(Object)).toEqual(false);
			expect(DomUtils.isAcceptedType(null)).toEqual(false);
			expect(DomUtils.isAcceptedType(undefined)).toEqual(false);
			expect(DomUtils.isAcceptedType(Function)).toEqual(false);
		});
		
	});
	
	describe("DomUtilsSetATtribute", function () {
		
		var htmlElement = document.createElement("div"),
			svgElement = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
		
		it("should be a function", function () {
			expect(DomUtils.setAttribute).toBeInstanceOf(Function);
		});
		
		it("should set attribute by assigning value to the Element's property if it's a dom node", function () {
			spyOn(htmlElement, "setAttribute");
			expect(DomUtils.setAttribute(htmlElement, "innerHTML", "Olives")).toEqual(true);
			expect(htmlElement.setAttribute.wasCalled).toEqual(false);
			expect(htmlElement.innerHTML).toEqual("Olives");
		});
		
		it("should set attribute by calling setAttribute if it's an SVGElement", function () {
			spyOn(svgElement, "setAttribute");
			expect(DomUtils.setAttribute(svgElement, "width", "10px")).toEqual(true);
			expect(svgElement.setAttribute.wasCalled).toEqual(true);
			expect(svgElement.setAttribute.mostRecentCall.args[0]).toEqual("width");
			expect(svgElement.setAttribute.mostRecentCall.args[1]).toEqual("10px");
		});
		
		it("should return false if the Element is neither an HTMLElement or an SVGElement", function () {
			expect(DomUtils.setAttribute({}, "false")).toEqual(false);
		});
		
	});

	describe("DomUtilsMatches", function(){

		it("should be a function", function(){
			expect(DomUtils.matches).toBeInstanceOf(Function);
		});

		//matchesSelector exists with prefix vendor
		it("should determine if an element matches a certain CSS selector from a parent node", function(){
			var parent = document.createElement("div");
			var node = document.createElement("p");
			node.className = "is awesome";
			parent.appendChild(node);


			expect(DomUtils.matches(node, "p", parent)).toEqual(true);
			expect(DomUtils.matches(node, "p.is.awesome", parent)).toEqual(true);
			expect(DomUtils.matches(node, ".other", parent)).toEqual(false);
			expect(DomUtils.matches(node, "#other", parent)).toEqual(false);
		});

	});
});