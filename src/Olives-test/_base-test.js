TestCase("_baseTest", {

	setUp: function () {
		this._base = Olives.create("_base");
	},
	
	"test _base's model is a TinyStore": function () {
		var model = this._base.model,
			tinyStore = Emily.require("TinyStore").create(),
			tools = Emily.require("Tools");
		
		assertTrue(tools.compareObjects(tinyStore, model));
	}
});

TestCase("_baseBinding", {
	
	setUp: function () {
		this._base = Olives.create("_base");
	},
	
	"test bind and unbind functions exist": function () {
		assertFunction(this._base.bind);
		assertFunction(this._base.unbind);
	},
	
	"test bind and unbind an object to model": function () {
		var p = {},
			handler;
		
		handler = this._base.bind(p, "content");
		assertTrue(!!handler);
		assertTrue(this._base.unbind(handler));
	},
	
	"test notifications set innerHTML by default": function () {
		var p = {},
			handler;
		
		handler = this._base.bind(p, "content");
		this._base.model.set("content", "my text");
		// innerHTML should be default association
		assertEquals("my text", p.innerHTML);
		this._base.unbind(handler);
	},
	
	"test sets value on binding if it exists": function () {
		var handler,
			p = {};
		
		this._base.model.set("content", "my text");
		handler = this._base.bind(p, "content");
		assertEquals("my text", p.innerHTML);
		this._base.unbind(handler);
	},
	
	"test default function can be overriden": function () {
		var handler,
			p = {},
			data = [1, 2];
		
		this._base.model.set("content", data);
		handler = this._base.bind(p, "content", function (value) {
			p.data = value;
		});
		assertSame(data, p.data);
		this._base.unbind(handler);
	},
	
	"test overriding function can be executed in given scope": function () {
		var handler,
			p = {},
			scope = {},
			spy = sinon.spy();
		
		handler = this._base.bind(p, "content", spy, scope);
		this._base.model.set("content", "text");
		assertSame(scope, spy.thisValues[0]);
		this._base.unbind(handler);
	}
});