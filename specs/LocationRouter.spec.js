/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["LocationRouter", "Router"], function (LocationRouter, Router) {

	describe("LocationRouter initialisation", function () {

		it("is a constructor function", function () {
			expect(LocationRouter).toBeInstanceOf(Function);
		});

		it("inherits from Emily's router", function () {
			var locationRouter = new LocationRouter();

			expect(Object.getPrototypeOf(locationRouter)).toBeInstanceOf(Router);
		});

	});

	describe("LocationRouter navigates to the route defined by the URL", function () {

		var locationRouter = null;

		beforeEach(function () {
			locationRouter = new LocationRouter();
		});

		it("has a default function for parsing a hashtag", function () {
			expect(locationRouter.parse).toBeInstanceOf(Function);

			expect(locationRouter.parse("hello/im/the/router")).toEqual(["hello", "im", "the", "router"]);
			expect(locationRouter.parse("#hello/im/the/router")).toEqual(["hello", "im", "the", "router"]);
		});

		it("parses the hashmark on start", function () {
			window.location.hash = "hello/im/the/router";

			expect(locationRouter.start).toBeInstanceOf(Function);
			spyOn(locationRouter, "parse");

			locationRouter.start();
			expect(locationRouter.parse).toHaveBeenCalledWith("#hello/im/the/router");
		});

		it("navigate to the route parsed on start", function () {
			window.location.hash = "hello/im/the/router";

			spyOn(locationRouter, "navigate");

			locationRouter.start();

			expect(locationRouter.navigate).toHaveBeenCalledWith("hello", "im", "the", "router");
		});

		it("listens to hash change on start", function () {
			spyOn(locationRouter, "bindOnHashChange");

			locationRouter.start();

			expect(locationRouter.bindOnHashChange).toHaveBeenCalled();
		});

		it("listens to hash change", function () {
			spyOn(window, "addEventListener");

			locationRouter.bindOnHashChange();

			expect(window.addEventListener).toHaveBeenCalledWith("hashchange", locationRouter.boundOnHashChange, true);
		});

		it("parses the new hash and navigates to the corresponding route when the hash changes", function () {
			var array = ["hello", "im", "the", "router"];
			spyOn(locationRouter, "parse").andReturn(array);
			spyOn(locationRouter, "navigate");

			locationRouter.onHashChange({ newUrl: "url#hello/im/the/router"});

			expect(locationRouter.parse).toHaveBeenCalledWith("hello/im/the/router");
			expect(locationRouter.navigate).toHaveBeenCalledWith("hello", "im", "the", "router");
		});

	});

	describe("LocationRouter updates the URL when navigating", function () {

		var locationRouter = null;

		beforeEach(function () {
			locationRouter = new LocationRouter();
		});

		it("has a default function for serializing the arguments into a valid hashmark", function () {
			expect(locationRouter.toUrl).toBeInstanceOf(Function);

			expect(locationRouter.toUrl(["hello", "im", "the", "router"])).toBe("hello/im/the/router");
		});

		it("listens to route changes on start", function () {
			spyOn(locationRouter, "bindOnRouteChange");

			locationRouter.start();

			expect(locationRouter.bindOnRouteChange).toHaveBeenCalled();
		});

		it("listens to route changes", function () {
			spyOn(locationRouter, "watch");

			locationRouter.bindOnRouteChange();

			expect(locationRouter.watch).toHaveBeenCalledWith(locationRouter.onRouteChange, locationRouter);
		});

		it("updates the hash in the url on route change", function () {
			spyOn(locationRouter, "toUrl").andReturn("hello/im/the/router");

			locationRouter.onRouteChange("hello", "im", "the", "router");
			expect(locationRouter.toUrl.mostRecentCall.args[0]).toEqual(["hello", "im", "the", "router"]);

			expect(window.location.hash).toBe("#hello/im/the/router");
		});

		it("clears the previous history on start so the route coming from the url is the initial one", function () {
			spyOn(locationRouter, "clearHistory");

			locationRouter.start();

			expect(locationRouter.clearHistory).toHaveBeenCalled();
		});

	});

	describe("LocationRouter can be destroyed", function () {
		var locationRouter = null;

		beforeEach(function() {
			locationRouter = new LocationRouter();
		});

		it("removes the watch handler", function () {
			spyOn(locationRouter, "watch").andReturn(1337);
			spyOn(locationRouter, "unwatch");

			locationRouter.start();

			locationRouter.destroy();

			expect(locationRouter.unwatch).toHaveBeenCalledWith(1337);
		});

		it("removes the hashchange event listener", function () {
			spyOn(window, "removeEventListener");

			locationRouter.start();

			locationRouter.destroy();

			expect(window.removeEventListener).toHaveBeenCalledWith("hashchange", locationRouter.boundOnHashChange, true);
		});
	});

	describe("LocationRouter integration", function () {
		it("shouldn't navigate two times when navigate() is called and the router listens to changes on the hashmark", function () {
			var locationRouter = new LocationRouter();
			var spy = jasmine.createSpy();

			locationRouter.set("route", spy);

			locationRouter.start();

			locationRouter.navigate("route", 66);

			expect(spy.callCount).toBe(1);
		});
	});

});
