/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

require(["Store", "LocalStore"], function (Store, LocalStore) {

	var localStorageMock = {
		setItem: jasmine.createSpy(),
		getItem: jasmine.createSpy().andReturn("{}")
	};

	describe("LocalStoreTest", function () {

		it("should be a constructor function", function () {
			expect(LocalStore).toBeInstanceOf(Function);
		});

		it("should inherit from Store", function () {
			expect(new LocalStore).toBeInstanceOf(Store);
		});

		it("should have a function to set/get localStorage", function () {
			var localStore = new LocalStore;

			expect(localStore.setLocalStorage).toBeInstanceOf(Function);
			expect(localStore.setLocalStorage()).toBe(false);
			expect(localStore.setLocalStorage(localStorageMock)).toBe(true);
			expect(localStore.getLocalStorage()).toBe(localStorageMock);
		});

		it("should sync with localStorage by default", function () {
			var localStore = new LocalStore;

			expect(localStore.getLocalStorage()).toBe(localStorage);
		});

	});

	describe("LocalStoreSync", function () {

		var localStore = null;

		beforeEach(function () {
			localStore = new LocalStore;
			localStorage.removeItem("store");
		});

		it("should have a sync function", function () {
			expect(localStore.sync).toBeInstanceOf(Function);
		});

		it("should sync with localStorage by default", function () {
			expect(localStore.sync()).toBe(false);
			expect(localStore.sync({})).toBe(false);
			expect(localStore.sync("store")).toBe(true);
		});

		it("should save its data into localStorage on sync", function () {
			var json;
			localStore.reset({a:10, b:20});
			localStore.sync("store");
			expect(localStorage.store).toBeTruthy();
			json = JSON.parse(localStorage.store);
			expect(json).toBeTruthy();
			expect(json.a).toBe(10);
			expect(json.b).toBe(20);
		});

		it("should load already existing data from localStorage on sync", function () {
			localStorage.store = '{"a":10,"b":20}';
			localStore.sync("store");
			expect(localStore.get("a")).toBe(10);
			expect(localStore.get("b")).toBe(20);
		});

		it("should save modifications in the localStorage", function () {
			var json;
			localStore.reset({a: 10, b: 20});
			localStore.sync("store");

			localStore.set("a", 15);
			localStore.set("c", 30);
			localStore.del("b");

			json = JSON.parse(localStorage.store);

			expect(json.a).toBe(15);
			expect(json.b).toBeUndefined();
			expect(json.c).toBe(30);
		});

		it("should work with array-like store too", function () {
			var json;
			localStore.reset([0, 1, 2, 3]);
			localStore.sync("store");

			localStore.set(0, 15);
			localStore.del(3);

			json = JSON.parse(localStorage.store);

			expect(json[0]).toBe(15);
			expect(json[1]).toBe(1);
			expect(json[2]).toBe(2);
			expect(json[3]).toBeUndefined();
		});

		it("should sync with another localStore too", function () {
			localStore.setLocalStorage(localStorageMock);
			localStore.sync("store");
			localStore.reset([1]);
			expect(localStorageMock.setItem.wasCalled).toBe(true);
		});

		it("shouldn't sync data with localStorage if it's not sync", function () {
			localStorageMock.setItem.reset();
			localStore.setLocalStorage(localStorageMock);
			expect(localStorageMock.setItem.wasCalled).toBe(false);
		});

	});

	describe("LocalStoreSyncMix", function () {

		var localStore = null;

		beforeEach(function () {
			localStore = new LocalStore;
			localStorage.removeItem("store");
		});

		it("should mix store's values and localStorage values, stores' taking over localStorages'", function () {
			var json;
			localStorage.store = '{"a":10, "b":20}';
			localStore.reset({b:30, c: 40});
			localStore.sync("store");

			json = JSON.parse(localStorage.store);
			expect(json.a).toBe(10);
			expect(json.b).toBe(30);
			expect(json.c).toBe(40);

			expect(localStore.get("a")).toBe(10);
			expect(localStore.get("b")).toBe(30);
			expect(localStore.get("c")).toBe(40);
		});

	});

	describe("LocalStoreInit", function () {

		it("should pass the init params to Store", function () {
			localStore = new LocalStore([]);
			expect(localStore.toJSON()).toBe("[]");
		});

	});

});
