require(["Olives/Model-plugin", "Store"], function (ModelPlugin, Store) {
	
	describe("ModelPluginTest", function () {
		it("should be a constructor function", function () {
			expect(ModelPlugin).toBeInstanceOf(Function);
		});
		
		it("should have the following API", function () {
			var modelPlugin = new ModelPlugin();
			
			expect(modelPlugin.toText).toBeInstanceOf(Function);
			expect(modelPlugin.toList).toBeInstanceOf(Function);
			expect(modelPlugin.setModel).toBeInstanceOf(Function);
			expect(modelPlugin.getModel).toBeInstanceOf(Function);
		});
		
	});
	
	describe("ModelPluginInit", function () {
		
		var modelPlugin = null,
			model = new Store;
		
		beforeEach(function () {
			modelPlugin = new ModelPlugin;
		});
		
		it("should allow for setting model if it's a store", function () {
			expect(modelPlugin.setModel()).toEqual(false);
			expect(modelPlugin.setModel({})).toEqual(false);
			expect(modelPlugin.setModel(model)).toEqual(true);
		});
		
		it("should return the model", function () {
			modelPlugin.setModel(model);
			expect(modelPlugin.getModel()).toBe(model);
		});
		
		it("should directly init the plugin with the given store", function () {
			modelPlugin = new ModelPlugin(model);
			expect(modelPlugin.getModel()).toBe(model);
		});
		
	});
	
	describe("ModelPluginToText", function () {
		
		var modelPlugin = null,
			model = null,
			dom = null;
		
		beforeEach(function () {
			dom = document.createElement("p");
			model =  new Store({content: "Olives is fun!"});
			modelPlugin = new ModelPlugin(model);
		});
		
		it("should link the model and the dom node with toText", function () {
			modelPlugin.toText(dom, "content");
			
			expect(dom.innerHTML).toEqual("Olives is fun!");
			model.set("content", "Olives is cool!");
			expect(dom.innerHTML).toEqual("Olives is cool!");
		});
		
		it("should not touch the dom if the value isn't set", function () {
			modelPlugin.toText(dom, "content2");
			expect(dom.innerHTML).toEqual("");
		});
		
		it("should set up the dom as soon as the value is set", function () {
			modelPlugin.toText(dom, "content2");
			model.set("content2", "sup!");
			expect(dom.innerHTML).toEqual("sup!");
		});
		
	});
	
	describe("ModelPluginToList", function () {
		var modelPlugin = null,
			model = null,
			dom = null;
		
		beforeEach(function () {
			dom = document.createElement("ul");
			dom.setAttribute("data-model", "toList"); 
			dom.appendChild(document.createElement("li"));
			model = new Store(["Olives", "is", "fun"]);
			modelPlugin = new ModelPlugin(model);
		});
		
		it("should expand the node inside", function () {
			modelPlugin.toList(dom);
			expect(dom.querySelectorAll("li").length).toEqual(3);
		});
		
		it("should'nt do anything if no inner node declared", function () {
			dom = document.createElement("ul");
			expect(function () {
				modelPlugin.toList(dom);
			}).not.toThrow();
		});
		
		it("should associate the model with the dom nodes", function () {
			modelPlugin.toList(dom);
			expect(dom.querySelectorAll("li")[0].innerHTML).toEqual("Olives");
			expect(dom.querySelectorAll("li")[1].innerHTML).toEqual("is");
			expect(dom.querySelectorAll("li")[2].innerHTML).toEqual("fun");
			expect(dom.querySelectorAll("li").length).toEqual(3);
		});
		
		it("should update the generated dom when the model is updated", function () {
			modelPlugin.toList(dom);
			model.set(0, "Olives and Emily");
			expect(dom.querySelectorAll("li")[0].innerHTML).toEqual("Olives and Emily");
			model.set(1, "are");
			expect(dom.querySelectorAll("li")[1].innerHTML).toEqual("are");
			model.alter("splice", 2, 0, "very");
			expect(dom.querySelectorAll("li")[2].innerHTML).toEqual("very");
			expect(dom.querySelectorAll("li")[3].innerHTML).toEqual("fun");
			expect(dom.querySelectorAll("li").length).toEqual(4);
		});
		
		it("should remove an item if it's removed from the model", function () {
			modelPlugin.toList(dom);
			model.alter("pop");
			expect(dom.querySelectorAll("li")[2]).toBeUndefined();
		});
	});
	
});