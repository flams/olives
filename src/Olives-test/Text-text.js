TestCase("TextTest", {
	setUp: function () {
		this.Text = Olives.create("Text");
	},
	
	"test Text exists and inherits from base": function () {
		assertObject(this.Text);
		assertObject(this.Text.model);
	}
});