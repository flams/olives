/**
 * https://github.com/flams/Olives-services
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 */

require(["Router", "Observable", "Store"],

function (Router, Observable, Store) {

	describe("Router", function () {

		it("is a constructor function", function () {
			expect(Router).toBeInstanceOf(Function);
		});

		it("has functions to get the internal observables", function () {
			var router = new Router;

			expect(router.getRoutesObservable()).toBeInstanceOf(Observable);
			expect(router.getEventsObservable()).toBeInstanceOf(Observable);
		});

	});

	describe("Router manages routes", function () {

		var router = null,
			routesObservable = null;

		beforeEach(function () {
			router = new Router;
			routesObservable = router.getRoutesObservable();
		});

		it("can set a new route", function () {
			var func = function () {},
				scope = {},
				handle;

			expect(router.set).toBeInstanceOf(Function);
			spyOn(routesObservable, "watch").andCallThrough();

			handle = router.set("test", func, scope);

			expect(routesObservable.watch.wasCalled).toBe(true);
			expect(routesObservable.watch.mostRecentCall.args[0]).toBe("test");
			expect(routesObservable.watch.mostRecentCall.args[1]).toBe(func);
			expect(routesObservable.watch.mostRecentCall.args[2]).toBe(scope);

			expect(routesObservable.hasObserver(handle)).toBe(true);
		});

		it("can remove routes", function () {
			var func = function () {},
			scope = {},
			handle;

			spyOn(routesObservable, "unwatch").andCallThrough();
			expect(router.unset).toBeInstanceOf(Function);

			handle = router.set("test", func, scope);

			expect(router.unset(handle)).toBe(true);

			expect(routesObservable.unwatch.wasCalled).toBe(true);
			expect(routesObservable.unwatch.mostRecentCall.args[0]).toBe(handle);
		});

	});

	describe("Router navigates to routes", function () {

		var router = null,
		routesObservable = null;

		beforeEach(function () {
			router = new Router;
			routesObservable = router.getRoutesObservable();
		});

		it("can load a route", function () {
			var params = {};
			expect(router.load).toBeInstanceOf(Function);

			router.set("test", function () {});
			spyOn(routesObservable, "notify").andCallThrough();
			expect(router.load("test", params)).toBe(true);

			expect(routesObservable.notify.wasCalled).toBe(true);
			expect(routesObservable.notify.mostRecentCall.args[0]).toBe("test");
			expect(routesObservable.notify.mostRecentCall.args[1]).toBe(params);
		});

		it("navigates to a defined route", function () {
			var params = {};

			router.set("test", function () {});
			spyOn(router, "load").andCallThrough();
			expect(router.navigate("test", params)).toBe(true);

			expect(router.load.wasCalled).toBe(true);
			expect(router.load.mostRecentCall.args[0]).toBe("test");
			expect(router.load.mostRecentCall.args[1]).toBe(params);
		});

		it("returns false if no route", function () {
			expect(router.navigate("route")).toBe(false);
		});

	});

	describe("Router notifies the activity", function () {

		var router = null,
		eventsObservable = null;

		beforeEach(function () {
			router = new Router;
			eventsObservable = router.getEventsObservable();
		});

		it("provides way to watch for route change", function () {
			var handle,
				scope = {},
				func = function () {};

			expect(router.watch).toBeInstanceOf(Function);
			spyOn(eventsObservable, "watch").andCallThrough();

			handle = router.watch(func, scope);

			expect(eventsObservable.watch.wasCalled).toBe(true);
			expect(eventsObservable.watch.mostRecentCall.args[0]).toBe("route");
			expect(eventsObservable.watch.mostRecentCall.args[1]).toBe(func);
			expect(eventsObservable.watch.mostRecentCall.args[2]).toBe(scope);

			expect(eventsObservable.hasObserver(handle)).toBe(true);
		});

		it("provides a function to unwatch route change", function () {
			var handle;

			handle = router.watch(function () {}, {});

			spyOn(eventsObservable, "unwatch").andCallThrough();
			expect(router.unwatch).toBeInstanceOf(Function);
			expect(router.unwatch(handle)).toBe(true);

			expect(eventsObservable.unwatch.wasCalled).toBe(true);
			expect(eventsObservable.unwatch.mostRecentCall.args[0]).toBe(handle);
		});

		it("notifies on route change", function () {
			var params = {};

			spyOn(eventsObservable, "notify");

			router.set("new route", function () {}, {});
			router.navigate("new route", params);

			expect(eventsObservable.notify.wasCalled).toBe(true);
			expect(eventsObservable.notify.mostRecentCall.args[0]).toBe("route");
			expect(eventsObservable.notify.mostRecentCall.args[1]).toBe("new route");
		});

		it("doesn't notify if route doesn't exist", function () {
			var params = {};

			spyOn(eventsObservable, "notify");

			router.navigate("route", params);

			expect(eventsObservable.notify.wasCalled).toBe(false);
		});
	});

	describe("Router can keep track of the history", function () {

		var router = null,
			historyStore = null;

		beforeEach(function () {
			router = new Router;
			historyStore = router.getHistoryStore();
		});

		it("has a function to retrieve history store", function () {
			expect(router.getHistoryStore).toBeInstanceOf(Function);
			expect(router.getHistoryStore()).toBeInstanceOf(Store);
			expect(router.getHistoryStore().toJSON()).toBe("[]");
		});

		it("sets history while changing route", function () {
			var obj0 = {},
				obj1 = {},
				obj2 = {};

			spyOn(historyStore, "alter");

			router.set("route", function () {});

			router.navigate("route", obj0);
			router.navigate("route", obj1);
			router.navigate("route", obj2);

			expect(historyStore.alter.wasCalled).toBe(true);
			expect(historyStore.alter.callCount).toBe(3);
			expect(historyStore.alter.mostRecentCall.args[0]).toBe("push");
			expect(historyStore.alter.mostRecentCall.args[1].route).toBe("route");
			expect(historyStore.alter.mostRecentCall.args[1].params).toBe(obj2);
		});

		it("can navigate through the history", function () {
			var obj0 = {o:0},
			obj1 = {o:1},
			obj2 = {o:2};

			expect(router.go).toBeInstanceOf(Function);

			router.set("route", function () {});

			router.navigate("route", obj0);
			router.navigate("route", obj1);
			router.navigate("route", obj2);

			spyOn(router, "load").andCallThrough();
			spyOn(historyStore, "get").andCallThrough();

			expect(router.go(-2)).toBe(true);

			expect(router.load.wasCalled).toBe(true);
			expect(router.load.mostRecentCall.args[0]).toBe("route");
			expect(router.load.mostRecentCall.args[1]).toBe(obj1);

			expect(historyStore.get.mostRecentCall.args[0]).toBe(1);

			expect(router.go(-2)).toBe(false);
			expect(historyStore.get.mostRecentCall.args[0]).toBe(-1);

			expect(router.go(1)).toBe(true);
			expect(router.load.mostRecentCall.args[0]).toBe("route");
			expect(router.load.mostRecentCall.args[1]).toBe(obj2);

			expect(historyStore.get.mostRecentCall.args[0]).toBe(2);

			expect(router.go(2)).toBe(false);
			expect(historyStore.get.mostRecentCall.args[0]).toBe(4);
		});

		it("has a back function for go(-1)", function () {
			expect(router.back).toBeInstanceOf(Function);

			spyOn(router, "go").andReturn(true);
			expect(router.back()).toBe(true);
			expect(router.go.wasCalled).toBe(true);
			expect(router.go.mostRecentCall.args[0]).toBe(-1);
		});

		it("has a forward function for go(1)", function() {
			expect(router.forward).toBeInstanceOf(Function);

			spyOn(router, "go").andReturn(true);
			expect(router.forward()).toBe(true);
			expect(router.go.wasCalled).toBe(true);
			expect(router.go.mostRecentCall.args[0]).toBe(1);
		});

		it("can limit the history to max history", function () {
			expect(router.getMaxHistory()).toBe(10);
			expect(router.setMaxHistory(-1)).toBe(false);
			expect(router.setMaxHistory(0)).toBe(true);
			expect(router.getMaxHistory()).toBe(0);
		});

		it("ensures that the history doesn't grow bigger than max history while navigating", function () {
			router.set("route", function () {});
			spyOn(router, "ensureMaxHistory");
			router.navigate("route");
			expect(router.ensureMaxHistory.wasCalled).toBe(true);
			expect(router.ensureMaxHistory.mostRecentCall.args[0]).toBe(historyStore);
		});

		it("reduces the depth of the history", function () {
			spyOn(historyStore, "count").andReturn(10);
			spyOn(router, "getMaxHistory").andReturn(10);
			spyOn(historyStore, "proxy");

			router.ensureMaxHistory(historyStore);

			expect(historyStore.proxy.wasCalled).toBe(false);

			router.getMaxHistory.andReturn(3);

			router.ensureMaxHistory(historyStore);

			expect(historyStore.proxy.wasCalled).toBe(true);
			expect(historyStore.proxy.mostRecentCall.args[0]).toBe("splice");
			expect(historyStore.proxy.mostRecentCall.args[1]).toBe(0);
			expect(historyStore.proxy.mostRecentCall.args[2]).toBe(7);
		});

		it("can clear the history", function () {
			spyOn(historyStore, "reset");

			historyStore.clearHistory();
			expect(historyStore.reset.wasCalled).toBe(true);
			expect(historyStore.reset.mostRecentCall.args[0].length).toBe(0);
		});

	});

});