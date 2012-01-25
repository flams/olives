require(["Olives/Model-plugin", "Store", "Olives/Plugins"], function (ModelPlugin, Store, Plugins) {

	
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
			plugins = null,
			model = null,
			dom = null;
		
		beforeEach(function () {
			dom = document.createElement("p");
			
			dom.dataset["model"] = "toText:content";
			model =  new Store({content: "Olives is fun!"});
			modelPlugin = new ModelPlugin(model);
			plugins = new Plugins;
			plugins.add("model", modelPlugin);
		});
		
		it("should link the model and the dom node with toText", function () {
			plugins.apply(dom);
			expect(dom.innerHTML).toEqual("Olives is fun!");
			model.set("content", "Olives is cool!");
			expect(dom.innerHTML).toEqual("Olives is cool!");
		});
		
		it("should not touch the dom if the value isn't set", function () {
			dom.dataset["model"] = "toText:content2";
			plugins.apply(dom);
			expect(dom.innerHTML).toEqual("");
		});
		
		it("should set up the dom as soon as the value is set", function () {
			dom.dataset["model"] = "toText:content2";
			plugins.apply(dom);
			model.set("content2", "sup!");
			expect(dom.innerHTML).toEqual("sup!");
		});
		
	});
	
	describe("ModelPluginToList", function () {
		var modelPlugin = null,
			model = null,
			dom = null,
			plugins = null;
		
		beforeEach(function () {
			dom = document.createElement("ul");

			dom.setAttribute("data-model", "toList"); 
			dom.innerHTML = '<li data-model="toText"></li>';

			model = new Store(["Olives", "is", "fun"]);
			modelPlugin = new ModelPlugin(model);
			plugins = new Plugins;
			plugins.add("model", modelPlugin);
		});
		
		it("should expand the node inside", function () {
			plugins.apply(dom);
			expect(dom.querySelectorAll("li").length).toEqual(3);
			expect(dom.querySelectorAll("li")[0].dataset["model.id"]).toEqual("0");
			expect(dom.querySelectorAll("li")[1].dataset["model.id"]).toEqual("1");
			expect(dom.querySelectorAll("li")[2].dataset["model.id"]).toEqual("2");
		});
		
		it("should'nt do anything if no inner node declared", function () {
			var dom = document.createElement("div");
			
			expect(function () {
				plugins.apply(dom);
			}).not.toThrow();
			expect(dom.querySelectorAll("*").length).toEqual(0);
		});
		
		it("should associate the model with the dom nodes", function () {
			plugins.apply(dom);
			expect(dom.querySelectorAll("li")[0].innerHTML).toEqual("Olives");
			expect(dom.querySelectorAll("li")[1].innerHTML).toEqual("is");
			expect(dom.querySelectorAll("li")[2].innerHTML).toEqual("fun");
			expect(dom.querySelectorAll("li").length).toEqual(3);
		});
		
		it("should update the generated dom when the model is updated", function () {
			plugins.apply(dom);
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
			plugins.apply(dom);
			model.alter("pop");
			expect(dom.querySelectorAll("li")[2]).toBeUndefined();
		});
	});
	
	describe("ModelPluginToListEnhanced", function () {
		
		var modelPlugin = null,
			model = null,
			dataSet = null,
			dom = null,
			plugins = null;
		
		beforeEach(function () {
			dom = document.createElement("ul");
			dom.dataset["model"] = "toList";
			
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
			
			plugins = new Plugins;
			plugins.add("model", modelPlugin);
		});
		
		it("should expand and fill in with a complex object's values", function () {
			dom.innerHTML = '<li><em data-model="toText:value.date"></em><strong data-model="toText:value.title"></strong>' +
						'<span data-model="toText:value.body"></span></li>';
			
			modelPlugin.toList(dom);
			expect(dom.querySelectorAll("li").length).toEqual(3);
			expect(dom.querySelectorAll("em")[0].innerHTML).toEqual(dataSet[0].value.date);
			expect(dom.querySelectorAll("strong")[0].innerHTML).toEqual(dataSet[0].value.title);
			expect(dom.querySelectorAll("span")[0].innerHTML).toEqual(dataSet[0].value.body);
			
			expect(dom.querySelectorAll("em")[1].innerHTML).toEqual(dataSet[1].value.date);
			expect(dom.querySelectorAll("strong")[1].innerHTML).toEqual(dataSet[1].value.title);
			expect(dom.querySelectorAll("span")[1].innerHTML).toEqual(dataSet[1].value.body);
			
			expect(dom.querySelectorAll("em")[2].innerHTML).toEqual(dataSet[2].value.date);
			expect(dom.querySelectorAll("strong")[2].innerHTML).toEqual(dataSet[2].value.title);
			expect(dom.querySelectorAll("span")[2].innerHTML).toEqual(dataSet[2].value.body);
		});
		
		it("should update such expanded list", function () {
			dom.innerHTML = '<li><em data-model="toText:value.date"></em><strong data-model="toText:value.title"></strong>' +
						'<span data-model="toText:value.body"></span></li>';
			
			modelPlugin.toList(dom);

			model.set(1, {
				value: {
					title: "Olives is fantastic",
					date: "2012/01/24",
					body: "innit"
				}
			});
			expect(dom.querySelectorAll("em")[1].innerHTML).toEqual("2012/01/24");
			expect(dom.querySelectorAll("strong")[1].innerHTML).toEqual("Olives is fantastic");
			expect(dom.querySelectorAll("span")[1].innerHTML).toEqual("innit");
		});

		
	});

});