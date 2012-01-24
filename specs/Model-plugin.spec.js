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
			dom = document.createElement("ul");
		
		beforeEach(function () {
			dom.setAttribute("data-model", "toList"); 
			dom.innerHTML = '<li data-model="item"></li>';
			model = new Store(["Olives", "is", "fun"]);
			modelPlugin = new ModelPlugin(model);
		});
		
		it("should expand the node inside", function () {
			modelPlugin.toList(dom);
			expect(dom.querySelectorAll("li").length).toEqual(3);
			expect(dom.querySelectorAll("li")[0].dataset["model.id"]).toEqual("0");
			expect(dom.querySelectorAll("li")[1].dataset["model.id"]).toEqual("1");
			expect(dom.querySelectorAll("li")[2].dataset["model.id"]).toEqual("2");
		});
		
		it("should'nt do anything if no inner node declared", function () {
			dom = document.createElement("ul");
			expect(function () {
				modelPlugin.toList(dom);
			}).not.toThrow();
		});
		
		it("should associate the model with the dom nodes", function () {
			modelPlugin.toList(dom);
			modelPlugin.item(dom.querySelectorAll("li")[0]);
			modelPlugin.item(dom.querySelectorAll("li")[1]);
			modelPlugin.item(dom.querySelectorAll("li")[2]);
			expect(dom.querySelectorAll("li")[0].innerHTML).toEqual("Olives");
			expect(dom.querySelectorAll("li")[1].innerHTML).toEqual("is");
			expect(dom.querySelectorAll("li")[2].innerHTML).toEqual("fun");
			expect(dom.querySelectorAll("li").length).toEqual(3);
		});
		
		it("should update the generated dom when the model is updated", function () {
			modelPlugin.toList(dom);
			modelPlugin.item(dom.querySelectorAll("li")[0]);
			modelPlugin.item(dom.querySelectorAll("li")[1]);
			modelPlugin.item(dom.querySelectorAll("li")[2]);
			model.set(0, "Olives and Emily");
			expect(dom.querySelectorAll("li")[0].innerHTML).toEqual("Olives and Emily");
			model.set(1, "are");
			expect(dom.querySelectorAll("li")[1].innerHTML).toEqual("are");
			model.alter("splice", 2, 0, "very");
			expect(dom.querySelectorAll("li")[2].innerHTML).toEqual("very");
			modelPlugin.item(dom.querySelectorAll("li")[3]);
			expect(dom.querySelectorAll("li")[3].innerHTML).toEqual("fun");
			expect(dom.querySelectorAll("li").length).toEqual(4);
		});
		
		it("should remove an item if it's removed from the model", function () {
			modelPlugin.toList(dom);
			model.alter("pop");
			expect(dom.querySelectorAll("li")[2]).toBeUndefined();
		});
	});
	
	describe("ModelPluginToListEnhanced", function () {
		
		var modelPlugin = null,
			model = null,
			dataset = null,
			dom = document.createElement("ul");
		
		beforeEach(function () {
			dataSet = [{value : {
							title: "Olives is cool",
							date: "2012/01/20",
							body: "it's very flexible"
						}},
						
						{value: {
							title: "Olives is fun",
							date: "2012/01/21",
							body: "you can cut its hair"
						}},
						
						{value: {
							title: "Olives is nice",
							date: "2012/01/22",
							body: "you ... no"
						}}	
			           ];
			model = new Store(dataSet);
			modelPlugin = new ModelPlugin(model);
			dom.dataset["model"] = "toList";
		});
		
		it("should expand and fill in with a complex object's values", function () {
			dom.innerHTML = '<li><em data-model="item:value.date"></em><strong data-model="item:value.title"></strong>' +
						'<span data-model="item:value.body"></span></li>';
			
			modelPlugin.toList(dom);
			expect(dom.querySelectorAll("li").length).toEqual(3);
			jstestdriver.console.log(dom.innerHTML)
			
		});
		
		/**
		 *  TO CONTINUE... I NEED ITEM TO HANDLE value.field.whatever 
		 *  I NEED TO REFACTOR MODELPLUGIN SO IT USES AN ITEM RENDERER TO AVOID ALL THE DRY STUFF
		 *  I NEED TO PASS PLUGIN.APPLY AROUND THE MODEL PLUGIN SO IT APPLIES IT ON NEW GENERATED DOM
		 *  MAYBE THERE COULD BE SOME INHERITANCE?? DUNNO!
		 *  
		 *  BUT WE'VE NEVER BEEN SO CLOSE WHICH IS COOL!!
		 * 
		 */
		
	});
	
});