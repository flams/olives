require(["Olives/Text", "Olives/OObject"], function (Text, OObject) {
	
	TestCase("TextTest", {
		setUp: function () {
			this.Text = Text.create();
		},
		
		"test Text exists and inherits from base": function () {
			assertSame(OObject, Object.getPrototypeOf(this.Text));
		}
	});


	
});
