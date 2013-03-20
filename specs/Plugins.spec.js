/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["Plugins"], function (Plugins) {

	describe("PluginsTest", function () {

		it("should have a constructor function", function () {
			expect(Plugins).toBeInstanceOf(Function);
		});

		it("should have the following API", function () {
			var plugins = new Plugins();

			expect(plugins.add).toBeInstanceOf(Function);
			expect(plugins.addAll).toBeInstanceOf(Function);
			expect(plugins.get).toBeInstanceOf(Function);
			expect(plugins.del).toBeInstanceOf(Function);
			expect(plugins.apply).toBeInstanceOf(Function);
		});

		it("can be directly initialized with a set of plugins", function () {
			var plugin = {},
				plugins = new Plugins({plugin: plugin});

			expect(plugins.get("plugin")).toBe(plugin);
		});
	});

	describe("PluginsPluginTest", function () {

		var plugins = null,
			plugin = {};

		beforeEach(function () {
			plugins = new Plugins();
		});

		it("should allow for adding plugins", function () {

			expect(plugins.add()).toBe(false);
			expect(plugins.add("test")).toBe(false);
			expect(plugins.add("test", null)).toBe(false);
			expect(plugins.add(plugin, "test")).toBe(false);
			expect(plugins.add("test", plugin)).toBe(true);

			expect(plugins.get("test")).toBe(plugin);
		});

		it("should allow for removing plugins", function () {
			plugins.add("test", plugin);

			expect(plugins.del("test")).toBe(true);
			expect(plugins.get("test")).toBeUndefined();
			expect(plugins.del("test")).toBe(true);
		});

		it("should allow for adding multiple plugins at once", function () {
			var plugin1 = {},
				plugin2 = {};

			spyOn(plugins, "add").andCallThrough();

			expect(plugins.addAll({
				"plugin1": plugin1,
				"plugin2": plugin2
			})).toBe(true);


			expect(plugins.add.wasCalled).toBe(true);
			expect(plugins.add.callCount).toBe(2);

			expect(plugins.get("plugin1")).toBe(plugin1);
			expect(plugins.get("plugin2")).toBe(plugin2);
		});

	});

	describe("PluginsPluginCall", function () {

		var plugins = null,
			plugin1 = null,
			plugin2 = null,
			dom = null;

		beforeEach(function () {
			var i=3;

			dom = document.createElement("div");

			while (i--) {
				dom.appendChild(document.createElement("p"));
			}

			plugins = new Plugins();
			plugin1 = {
				method: jasmine.createSpy()
			};

			plugin2 = {
				method1: jasmine.createSpy(),
				method2: jasmine.createSpy()
			};
		});

		it("should apply the plugins only on dom nodes", function () {
			expect(plugins.apply()).toBe(false);
			expect(plugins.apply({})).toBe(false);
			expect(plugins.apply(dom)).toBe(dom);
		});

		it("should call the plugins on apply", function () {
			dom.setAttribute("data-plugin1", "method");
			plugins.apply(dom);
			expect(plugin1.method.wasCalled).toBe(false);

			plugins.add("plugin1", plugin1);
			plugins.apply(dom);
			expect(plugin1.method.wasCalled).toBe(true);
			expect(plugin1.method.callCount).toBe(1);
			expect(plugin1.method.mostRecentCall.object).toBe(plugin1);
		});

		it("should call multiple plugins on apply", function () {
			dom.innerHTML = '<span data-plugin1="method"></span><p data-plugin2="method1"></p>' +
								'<div data-plugin1="method" data-plugin2="method1;method2"></div>';

			plugins.add("plugin1", plugin1);
			plugins.add("plugin2", plugin2);

			plugins.apply(dom);
			expect(plugin1.method.callCount).toBe(2);
			expect(plugin1.method.mostRecentCall.object).toBe(plugin1);
			expect(plugin2.method1.callCount).toBe(2);
			expect(plugin2.method1.mostRecentCall.object).toBe(plugin2);
			expect(plugin2.method2.callCount).toBe(1);
			expect(plugin2.method2.mostRecentCall.object).toBe(plugin2);

		});


		it("should call also if spaces are present between two methods", function () {
			dom.setAttribute("data-plugin2", "method1; method2");
			plugins.add("plugin2", plugin2);
			plugins.apply(dom);
			expect(plugin2.method2.wasCalled).toBe(true);
		});

		it("should'nt fail if no such method", function () {
			dom.setAttribute("data-plugin2", "method3");
			plugins.add("plugin2", plugin2);
			expect(function () {
				plugins.apply(dom);
			}).not.toThrow();

			expect(plugin2.method2.wasCalled);
		});

		it("should pass parameters to the method", function () {
			dom.setAttribute("data-plugin2", "method1:param1, param2; method2: param1");
			plugins.add("plugin2", plugin2);
			plugins.apply(dom);
			expect(plugin2.method1.callCount).toBe(1);
			expect(plugin2.method1.mostRecentCall.args[0]).toBe(dom);
			expect(plugin2.method1.mostRecentCall.args[1]).toBe("param1");
			expect(plugin2.method1.mostRecentCall.args[2]).toBe("param2");
			expect(plugin2.method2.mostRecentCall.args[0]).toBe(dom);
			expect(plugin2.method2.mostRecentCall.args[1]).toBe("param1");
		});

	});

	describe("PluginsApplyAvailableToPlugin", function (){

		var plugins = null,
			plugin = null;

		beforeEach(function () {
			plugins = new Plugins();
			plugin = {};
			plugins.add("plugin", plugin);
		});

		it("should decorate with a plugins property", function () {
			expect(plugin.plugins).toBeInstanceOf(Object);
		});

		it("should decorate with a name property that holds the plugin's name", function () {
			expect(plugin.plugins.name).toBe("plugin");
		});

		it("should decorate with an apply function", function () {
			var div = document.createElement("div"),
				applied;
			spyOn(plugins, "apply").andCallThrough();
			applied = plugin.plugins.apply(div);

			expect(plugins.apply.wasCalled).toBe(true);
			expect(plugins.apply.mostRecentCall.object).toBe(plugins);
			expect(plugins.apply.mostRecentCall.args[0]).toBe(div);
			expect(applied).toBe(div);
		});
	});
});
