require(["Olives/Text", "Olives/OObject"], function (Text, OObject) {
	
	describe("TextTest", function () {
	
		it("should be an object with a create function", function () {
			expect(Text).toBeInstanceOf(Object);
			expect(Text.create).toBeInstanceOf(Function);
		});
		
	});
	
	describe("TextStructure", function () {

		var text = null;
		
		beforeEach(function() {
			text = Text.create();
		});		
		
		it("should inherit from OObject once created", function () {
			expect(OObject.isAugmenting(text)).toEqual(true);
		});

		it("should have only one p tag in its rendered dom", function () {
			text.action("render");
			expect(text.dom.querySelectorAll("p").length).toEqual(1);
		});
		
	});
	
	describe("TextContent", function () {
		
		var text = null,
			name = "content",
			content = "Olives is cool!";
		
		beforeEach(function () {
			text = Text.create({content: content});
		});
		
		it("should pass the content at creation", function () {
			expect(text.model.get("content")).toEqual(content);
			text.action("render");
			expect(text.dom.querySelector("[data-connect='content']").innerHTML).toEqual(content);
		});
		
		it("should have its p tag's innerHTML connected to the model", function () {
			text.action("render");
			var p = text.dom.querySelector("p[data-connect='content']");
			text.model.set("content", "Olives is cool!");
			expect(p.innerHTML).toEqual("Olives is cool!");
			text.model.set("content", "This one's just for fun!");
			expect(p.innerHTML).toEqual("This one's just for fun!");
		});
		
		it("should always reflect the model's value", function () {
			text.action("render");

			text.model.set("content", "new text");
			expect(text.dom.querySelector("p[data-connect='content']").innerHTML).toEqual("new text");
			
			text.template = "<p data-connect='content2'></p>";
			text.action("render");
			expect(text.dom.querySelector("p[data-connect='content2']").innerHTML).toBeFalsy();

			text.model.set("content2", "should work");text.model.set("content2", "should work");
			expect(text.dom.querySelector("p[data-connect='content2']").innerHTML).toEqual("should work");
		});

	});
	
	describe("TextCustomization", function () {
		var text = null,
			txt1 = "text1",
			txt2 = "text2",
			template = "<span data-connect='txt1'></span>" +
						"<span data-connect='txt2'></span>";
		
		beforeEach(function () {
			text = Text.create();
		});
		
		it("should associate the values to the new template", function () {
			text.template = template;
			text.action("render");
			
			text.model.set("txt1", txt1);
			expect(text.dom.querySelector("[data-connect='txt1']").innerHTML).toEqual(txt1);
			text.model.set("txt2", txt2);
			expect(text.dom.querySelector("[data-connect='txt2']").innerHTML).toEqual(txt2);
		});
		
		it("should associate the value to the new template from the beginning", function () {
			text = Text.create({
				txt1: txt1,
				txt2: txt2
			});
			
			text.template = template;
			text.action("render");

			expect(text.dom.querySelector("[data-connect='txt1']").innerHTML).toEqual(txt1);
			expect(text.dom.querySelector("[data-connect='txt2']").innerHTML).toEqual(txt2);
		});
		
		it("should also associate the values from the template", function () {
			text = Text.create();
			text.template = "<span data-connect='txt1'>Olives</span>" +
			"<span data-connect='txt2'>is cool!</span>";
			

			text.action("render");
			expect(text.dom.querySelector("[data-connect='txt1']").innerHTML).toEqual("Olives");
			expect(text.dom.querySelector("[data-connect='txt2']").innerHTML).toEqual("is cool!");
			
			text.model.set("txt1", "isn't");
			text.model.set("txt2", "it?");
			
			expect(text.dom.querySelector("[data-connect='txt1']").innerHTML).toEqual("isn't");
			expect(text.dom.querySelector("[data-connect='txt2']").innerHTML).toEqual("it?");
			
		});
	});


	
});
