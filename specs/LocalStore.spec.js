/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

require(["Store", "Olives/LocalStore"], function (Store, LocalStore) {

	describe("LocalStoreTest", function () {
		
		it("should be a constructor function", function () {
			expect(LocalStore).toBeInstanceOf(Function);
		});
		
		it("should inherit from Store", function () {
			expect(new LocalStore).toBeInstanceOf(Store);
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
		
		it("should sync with localStorage", function () {
			expect(localStore.sync()).toEqual(false);
			expect(localStore.sync({})).toEqual(false);
			expect(localStore.sync("store")).toEqual(true);
		});
		
		it("should save its data into localStorage on sync", function () {
			var json;
			localStore.reset({a:10, b:20});
			localStore.sync("store");
			expect(localStorage.store).toBeTruthy();
			json = JSON.parse(localStorage.store);
			expect(json).toBeTruthy();
			expect(json.a).toEqual(10);
			expect(json.b).toEqual(20);
		});
		
		it("should load already existing data from localStorage on sync", function () {
			localStorage.store = '{"a":10,"b":20}';
			localStore.sync("store");
			expect(localStore.get("a")).toEqual(10);
			expect(localStore.get("b")).toEqual(20);
		});
		
		it("should save modifications in the localStorage", function () {
			var json;
			localStore.reset({a: 10, b: 20});
			localStore.sync("store");
			
			localStore.set("a", 15);
			localStore.set("c", 30);
			localStore.del("b");
			
			json = JSON.parse(localStorage.store);
			
			expect(json.a).toEqual(15);
			expect(json.b).toBeUndefined();
			expect(json.c).toEqual(30);
		});
		
		it("should work with array-like store too", function () {
			var json;
			localStore.reset([0, 1, 2, 3]);
			localStore.sync("store");
			
			localStore.set(0, 15);
			localStore.del(3);
			
			json = JSON.parse(localStorage.store);
			
			expect(json[0]).toEqual(15);
			expect(json[1]).toEqual(1);
			expect(json[2]).toEqual(2);
			expect(json[3]).toBeUndefined();
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
			expect(json.a).toEqual(10);
			expect(json.b).toEqual(30);
			expect(json.c).toEqual(40);
			
			expect(localStore.get("a")).toEqual(10);
			expect(localStore.get("b")).toEqual(30);
			expect(localStore.get("c")).toEqual(40);
		});
		
	});
	
	describe("LocalStoreInit", function () {
		
		it("should pass the init params to Store", function () {
			localStore = new LocalStore([]);
			expect(localStore.toJSON()).toEqual("[]");
		});
		
	});
	
});
