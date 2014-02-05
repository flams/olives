/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */
var LocationRouter = require("../src/LocationRouter"),
    Router = require("emily").Router;

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

    it("has a default route to navigate to when none is supplied in the url", function () {
        expect(locationRouter.getDefaultRoute).toBeInstanceOf(Function);
        expect(locationRouter.getDefaultRoute()).toBe("");

        expect(locationRouter.setDefaultRoute).toBeInstanceOf(Function);
        expect(locationRouter.setDefaultRoute()).toBe(false);
        expect(locationRouter.setDefaultRoute("")).toBe(false);
        expect(locationRouter.setDefaultRoute("default")).toBe(true);

        expect(locationRouter.getDefaultRoute()).toBe("default");
    });

    it("can be given the default route on start", function () {
        locationRouter.start("home");

        expect(locationRouter.getDefaultRoute()).toBe("home");
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

    it("navigates to the default route if no route is defined in the url", function () {
        window.location.hash = "";

        spyOn(locationRouter, "navigate");

        locationRouter.start("default");

        expect(locationRouter.navigate).toHaveBeenCalledWith("default");
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
        window.location.hash = "hello/im/the/router";
        spyOn(locationRouter, "parse").andReturn(array);
        spyOn(locationRouter, "navigate");

        locationRouter.onHashChange();

        expect(locationRouter.parse).toHaveBeenCalledWith(window.location.hash);
        expect(locationRouter.navigate).toHaveBeenCalledWith("hello", "im", "the", "router");
    });

    it("navigates to the default route if the hash is empty", function () {
        window.location.hash = "";

        spyOn(locationRouter, "navigate");
        locationRouter.setDefaultRoute("default");

        locationRouter.onHashChange();

        expect(locationRouter.navigate).toHaveBeenCalledWith("default");
    });

    it("doesn't navigate on hash change when the route in the url has been set by a route change event", function () {
        locationRouter.onRouteChange("my", "route");
        spyOn(locationRouter, "navigate");

        locationRouter.onHashChange();

        expect(locationRouter.navigate).not.toHaveBeenCalled();
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

    it("remembers the last route that has been navigated to", function () {
        window.location.hash = "my/route";

        locationRouter = new LocationRouter();

        expect(locationRouter.getLastRoute()).toBe(window.location.hash);

        locationRouter.onRouteChange("my", "route");

        expect(locationRouter.getLastRoute()).toBe(window.location.hash);
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