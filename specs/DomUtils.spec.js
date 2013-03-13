/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["DomUtils"], function (DomUtils) {

	describe("DomUtilsGetNodes", function () {

		it("should be a function", function () {
			expect(DomUtils.getNodes).toBeInstanceOf(Function);
		});

		it("should only accept a dom node", function () {
			expect(DomUtils.getNodes()).toBe(false);
			expect(DomUtils.getNodes({})).toBe(false);
			expect(DomUtils.getNodes(document.createElement("div"))).toBeTruthy();
		});

		it("should return the list of dom nodes", function () {
			var dom = document.createElement("div"),
				ul = document.createElement("ul"),
				p = document.createElement("p"),
				li1 = document.createElement("li"),
				li2 = document.createElement("li"),
				nodes;

			dom.appendChild(p);
			dom.appendChild(ul);
			ul.appendChild(li1);
			ul.appendChild(li2);

			nodes = DomUtils.getNodes(ul);
			expect(nodes.length).toBe(4);
			expect(nodes[0]).toBe(p);
			expect(nodes[1]).toBe(ul);
			expect(nodes[2]).toBe(li1);
			expect(nodes[3]).toBe(li2);
		});

		it("should allow for specifying a query string", function () {
			var dom = document.createElement("div"),
				ul = document.createElement("ul"),
				p = document.createElement("p"),
				li1 = document.createElement("li"),
				li2 = document.createElement("li"),
				nodes;

			dom.appendChild(p);
			dom.appendChild(ul);
			ul.appendChild(li1);
			ul.appendChild(li2);

			nodes = DomUtils.getNodes(dom, "div");
			expect(nodes.length).toBe(1);
			expect(nodes[0]).toBe(dom);

			nodes = DomUtils.getNodes(dom, "li");
			expect(nodes.length).toBe(2);
			expect(nodes[0]).toBe(li1);
			expect(nodes[1]).toBe(li2);
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
			expect(DomUtils.getDataset()).toBe(false);
			expect(DomUtils.getDataset({})).toBe(false);
			expect(DomUtils.getDataset(dom)).toBeTruthy();
		});

		it("should return an object similar to a dataset", function () {
			var dataset = DomUtils.getDataset(dom);
			expect(dataset).toBeInstanceOf(Object);
			expect(dataset["plugin1"]).toBe("name1");
			expect(dataset["plugin2"]).toBe("name2");
		});

		it("should exactly return the dataset if the browser supports it", function () {
			if (dom.dataset) {
				dom.dataset["plugin1"] = "browser supports dataset";
				var dataset = DomUtils.getDataset(dom);
				expect(dataset["plugin1"]).toBe("browser supports dataset");
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
				expect(DomUtils.isAcceptedType(type)).toBe(true);
			});
		});

		it("should return false if not an accepted type", function () {
			expect(DomUtils.isAcceptedType(Object)).toBe(false);
			expect(DomUtils.isAcceptedType(null)).toBe(false);
			expect(DomUtils.isAcceptedType(undefined)).toBe(false);
			expect(DomUtils.isAcceptedType(Function)).toBe(false);
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
			expect(DomUtils.setAttribute(htmlElement, "innerHTML", "Olives")).toBe(true);
			expect(htmlElement.setAttribute.wasCalled).toBe(false);
			expect(htmlElement.innerHTML).toBe("Olives");
		});

		it("should set attribute by calling setAttribute if it's an SVGElement", function () {
			spyOn(svgElement, "setAttribute");
			expect(DomUtils.setAttribute(svgElement, "width", "10px")).toBe(true);
			expect(svgElement.setAttribute.wasCalled).toBe(true);
			expect(svgElement.setAttribute.mostRecentCall.args[0]).toBe("width");
			expect(svgElement.setAttribute.mostRecentCall.args[1]).toBe("10px");
		});

		it("should return false if the Element is neither an HTMLElement or an SVGElement", function () {
			expect(DomUtils.setAttribute({}, "false")).toBe(false);
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
			node.className = "isawesome";
			parent.appendChild(node);


			expect(DomUtils.matches(parent, "p", node)).toBe(true);
			expect(DomUtils.matches(parent, "p.isawesome", node)).toBe(true);
			expect(DomUtils.matches(parent, ".other", node)).toBe(false);
			expect(DomUtils.matches(parent, "#other", node)).toBe(false);
		});

	});
});
