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
			
			nodes = DomUtils.getNodes(dom);
			expect(nodes.length).toEqual(5);
			expect(nodes[0]).toBeInstanceOf(HTMLDivElement);
			expect(nodes[1]).toBeInstanceOf(HTMLParagraphElement);
			expect(nodes[2]).toBeInstanceOf(HTMLUListElement);
			expect(nodes[3]).toBeInstanceOf(HTMLLIElement);
			expect(nodes[4]).toBeInstanceOf(HTMLLIElement);
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
	
	describe("DomUtilsLoopNodes", function () {
		
		var ul = document.createElement("ul"),
			li1 = document.createElement("li"),
			li2 = document.createElement("li");
			li3 = document.createElement("li");
		
		ul.appendChild(li1);
		ul.appendChild(li2);
		ul.appendChild(li3);
		
		it("should be a function", function () {
			expect(DomUtils.loopNodes).toBeInstanceOf(Function);
		});
		
		it("should only loop through nodeList", function () {
			var nodeList = DomUtils.getNodes(ul, "li"),
				spy = jasmine.createSpy();
			
			expect(DomUtils.loopNodes([], spy)).toEqual(false);
			expect(DomUtils.loopNodes({}, spy)).toEqual(false);
			expect(DomUtils.loopNodes()).toEqual(false);
			expect(DomUtils.loopNodes(nodeList)).toEqual(false);
			expect(DomUtils.loopNodes(nodeList, spy)).toEqual(true);
		});
		
		it("should loop through nodeList", function () {
			var nodeList = DomUtils.getNodes(ul, "li"),
				spy = jasmine.createSpy();
		
			DomUtils.loopNodes(nodeList, spy);
			
			expect(spy.callCount).toEqual(3);
			expect(spy.calls[0].args[0]).toEqual(li1);
			expect(spy.calls[1].args[0]).toEqual(li2);
			expect(spy.calls[2].args[0]).toEqual(li3);
		});
		
		it("should loop through nodeList in scope", function () {
			var nodeList = DomUtils.getNodes(ul, "li"),
				spy = jasmine.createSpy(),
				thisObj = {};
		
			DomUtils.loopNodes(nodeList, spy, thisObj);
			
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
	});
	
	
	
});