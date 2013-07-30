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

		it("has a default function for parsing a hashtag and calling the specified route", function () {
			expect(locationRouter.parse).toBeInstanceOf(Function);

			spyOn(locationRouter, "navigate");

			expect(locationRouter.parse("hello/im/the/router")).toEqual(["hello", "im", "the", "router"]);
			expect(locationRouter.parse("#hello/im/the/router")).toEqual(["hello", "im", "the", "router"]);
		});

		it("parses the hashmark", function () {
			window.location.hash = "hello/im/the/router";

			expect(locationRouter.start).toBeInstanceOf(Function);
			spyOn(locationRouter, "parse");

			locationRouter.start();
			expect(locationRouter.parse).toHaveBeenCalledWith("#hello/im/the/router");
		});

	});

	describe("LocationRouter updates the URL when navigating", function () {

		var locationRouter = null;

		beforeEach(function () {
			locationRouter = new LocationRouter();
		});

		it("has a default function for serializing the arguments into a valid hashmark", function () {
			expect(locationRouter.toUrl).toBeInstanceOf(Function);

		});

	});

});
