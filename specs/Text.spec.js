require(["Olives/Text", "Olives/OObject"], function (Text, OObject) {
/**
	describe("TextTest", function () {
	
		it("should be a constructor function", function () {
			expect(Text).toBeInstanceOf(Function);
		});
		
		it("should inherit from OObject", function () {
			expect(new Text).toBeInstanceOf(OObject);
		});
		
		it("should'nt have shared prototypes", function () {
			var txt1 = new Text(),
				txt2 = new Text();
			expect(Object.getPrototypeOf(txt1)).not.toBe(Object.getPrototypeOf(txt2));
		});
		
	});
	
	describe("TextStructure", function () {

		var text = null;
		
		beforeEach(function() {
			text = new Text();
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
			text = new Text({content: content});
		});
		
		it("should pass the content at creation", function () {
			expect(text.model.get("content")).toEqual(content);
			text.action("render");
			expect(text.dom.querySelector("[data-model='content']").innerHTML).toEqual(content);
		});
		
		it("should have its p tag's innerHTML connected to the model", function () {
			text.action("render");
			var p = text.dom.querySelector("p[data-model='content']");
			text.model.set("content", "Olives is cool!");
			expect(p.innerHTML).toEqual("Olives is cool!");
			text.model.set("content", "This one's just for fun!");
			expect(p.innerHTML).toEqual("This one's just for fun!");
		});
		
		it("should always reflect the model's value", function () {
			text.action("render");

			text.model.set("content", "new text");
			expect(text.dom.querySelector("p[data-model='content']").innerHTML).toEqual("new text");
			
			text.template = "<p data-model='content2'></p>";
			text.action("render");
			expect(text.dom.querySelector("p[data-model='content2']").innerHTML).toEqual("");

			text.model.set("content2", "should work");text.model.set("content2", "should work");
			expect(text.dom.querySelector("p[data-model='content2']").innerHTML).toEqual("should work");
		});

	});
	
	describe("TextCustomization", function () {
		var text = null,
			txt1 = "text1",
			txt2 = "text2",
			template = "<span data-model='txt1'></span>" +
						"<span data-model='txt2'></span>";
		
		beforeEach(function () {
			text = new Text();
		});
		
		it("should associate the values to the new template", function () {
			text.template = template;
			text.action("render");
			
			text.model.set("txt1", txt1);
			expect(text.dom.querySelector("[data-model='txt1']").innerHTML).toEqual(txt1);
			text.model.set("txt2", txt2);
			expect(text.dom.querySelector("[data-model='txt2']").innerHTML).toEqual(txt2);
		});
		
		it("should associate the value to the new template from the beginning", function () {
			text = new Text({
				txt1: txt1,
				txt2: txt2
			});
			
			text.template = template;
			text.action("render");

			expect(text.dom.querySelector("[data-model='txt1']").innerHTML).toEqual(txt1);
			expect(text.dom.querySelector("[data-model='txt2']").innerHTML).toEqual(txt2);
		});
		
		it("should also associate the values from the template", function () {
			text.template = "<span data-model='txt1'>Olives</span>" +
			"<span data-model='txt2'>is cool!</span>";
			

			text.action("render");

			expect(text.dom.querySelector("[data-model='txt1']").innerHTML).toEqual("Olives");
			expect(text.dom.querySelector("[data-model='txt2']").innerHTML).toEqual("is cool!");
			
			text.model.set("txt1", "isn't");
			text.model.set("txt2", "it?");
			
			expect(text.dom.querySelector("[data-model='txt1']").innerHTML).toEqual("isn't");
			expect(text.dom.querySelector("[data-model='txt2']").innerHTML).toEqual("it?");
			
		});
	});*/
});
