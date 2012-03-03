/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

require(["Store", "Observable"], function (Store, Observable) {
	
	describe("StoreTest", function () {

		it("should be an object with a constructor", function () {
			expect(Store).toBeInstanceOf(Function);
		});
		
		it("should have the following methods once created", function () {
			var store = new Store();
			expect(store.getNbItems).toBeInstanceOf(Function);
			expect(store.get).toBeInstanceOf(Function);
			expect(store.set).toBeInstanceOf(Function);
			expect(store.has).toBeInstanceOf(Function);
			expect(store.del).toBeInstanceOf(Function);
			expect(store.toJSON).toBeInstanceOf(Function);
			expect(store.alter).toBeInstanceOf(Function);
			expect(store.watch).toBeInstanceOf(Function);
			expect(store.unwatch).toBeInstanceOf(Function);
			expect(store.getStoreObservable).toBeInstanceOf(Function);
			expect(store.getValueObservable).toBeInstanceOf(Function);
			expect(store.watchValue).toBeInstanceOf(Function);
			expect(store.unwatchValue).toBeInstanceOf(Function);
		});
	
	});
	
	describe("StoreGetSetDelDump", function () {
		
		var store = null;
		
		beforeEach(function () {
			store = new Store();
		});
		
		it("should set values of any type", function () {
			var obj = {},
				arr = [],
				func = function () {};
				
			store.set("test");
			expect(store.has("test")).toEqual(true);
			expect(store.get("test")).toBeUndefined();
			store.set("test", null);
			expect(store.get("test")).toEqual(null);
			store.set("test", obj);
			expect(store.get("test")).toBe(obj)
			store.set("test", arr);
			expect(store.get("test")).toEqual(arr);
			store.set("test", func);
			expect(store.get("test")).toEqual(func);
			store.set("test", "yes");
			expect(store.get("test")).toEqual("yes");
		});
		
		
		it("should return undefined if does'nt exist", function () {
			expect(store.get("has not")).toBeUndefined();
		});
		
		it("should update value if it already exists", function () {
			store.set("test", true);
			expect(store.set("test", false)).toEqual(true);
			expect(store.get("test")).toEqual(false);
		});
		
		it("should return false if name is not set", function () {
			expect(store.set()).toEqual(false);
		});
		
		it("should del value", function () {
			store.set("test", true);
			expect(store.del("test")).toEqual(true);
			expect(store.has("test")).toEqual(false);
			expect(store.del("fake")).toEqual(false);
		});

		it("should allow for returning a JSON version of the store", function () {
			var values = {
					key1: "value1",
					key2: "value2"
				},
				json;
			store.reset(values);
			json = JSON.parse(store.toJSON());
			expect(json.key1).toEqual("value1");
			expect(json.key2).toEqual("value2");
			expect(Object.getOwnPropertyNames(json).length).toEqual(2);
		});
		
	});
	
	describe("StoreObservable", function () {
		
		var store = null,
			storeObservable = null;
		
		beforeEach(function () {
			store = new Store();
			storeObservable = store.getStoreObservable();
		});
		
		it("should implement an Observable", function () {
			expect(storeObservable).toBeInstanceOf(Observable);
		});
		
		it("should have a function to watch the store", function () {
			var spy = jasmine.createSpy(),
				name = "value",
				scope = {};
			
			spyOn(storeObservable, "watch").andCallThrough();
			
			expect(store.watch(name, spy, scope)).toBeTruthy();
			expect(storeObservable.watch.wasCalled).toEqual(true);
			expect(storeObservable.watch.mostRecentCall.args[0]).toEqual(name);
			expect(storeObservable.watch.mostRecentCall.args[1]).toBe(spy);
			expect(storeObservable.watch.mostRecentCall.args[2]).toBe(scope);
		});
		
		it("should notify on set", function () {
			spyOn(storeObservable, "notify");

			store.set("test");
			expect(storeObservable.notify.wasCalled).toEqual(true);
			expect(storeObservable.notify.mostRecentCall.args[0]).toEqual("added");
			expect(storeObservable.notify.mostRecentCall.args[1]).toEqual("test");
			expect(storeObservable.notify.mostRecentCall.args[2]).toBeUndefined();
		});
		
		it("should notify with new value on update", function () {
			spyOn(storeObservable, "notify");

			store.set("test");
			store.set("test", "newValue");
			expect(storeObservable.notify.wasCalled).toEqual(true);
			expect(storeObservable.notify.mostRecentCall.args[0]).toEqual("updated");
			expect(storeObservable.notify.mostRecentCall.args[1]).toEqual("test");
			expect(storeObservable.notify.mostRecentCall.args[2]).toEqual("newValue");
		});
		
		it("should provide value when said available", function () {
			var callback = function () {
				callback.ret = store.get("test");
			};
			store.watch("added", callback);
			store.set("test", "yes");
			
			expect(callback.ret).toEqual("yes");
		});
		
		it("should notify on del", function () {
			spyOn(storeObservable, "notify");

			store.set("test");
			store.del("test");
			expect(storeObservable.notify.wasCalled).toEqual(true);
			expect(storeObservable.notify.mostRecentCall.args[0]).toEqual("deleted");
			expect(storeObservable.notify.mostRecentCall.args[1]).toEqual("test");
			expect(storeObservable.notify.mostRecentCall.args[2]).toBeUndefined();
		});
		
		it("can unwatch value", function () {
			spyOn(storeObservable, "unwatch");

			handler = store.watch("added", function(){});
			store.unwatch(handler);
			
			expect(storeObservable.unwatch.wasCalled).toEqual(true);
			expect(storeObservable.unwatch.mostRecentCall.args[0]).toBe(handler);
		});

	});
	
	describe("StoreValueObservable", function () {
		var store = null,
			storeObservable = null;
		
		beforeEach(function () {
			store = new Store();
			valueObservable = store.getValueObservable();
		});
		
		it("should implement an Observable", function () {
			expect(valueObservable).toBeInstanceOf(Observable);
		});
		
		it("should have a function to watch the value", function () {
			var spy = jasmine.createSpy(),
				name = "value",
				scope = {};
			
			spyOn(valueObservable, "watch").andCallThrough();
			
			expect(store.watchValue(name, spy, scope)).toBeTruthy();
			expect(valueObservable.watch.wasCalled).toEqual(true);
			expect(valueObservable.watch.mostRecentCall.args[0]).toEqual(name);
			expect(valueObservable.watch.mostRecentCall.args[1]).toBe(spy);
			expect(valueObservable.watch.mostRecentCall.args[2]).toBe(scope);
		});
		
		it("should notify on set", function () {
			spyOn(valueObservable, "notify");

			store.set("test");
			expect(valueObservable.notify.wasCalled).toEqual(true);
			expect(valueObservable.notify.mostRecentCall.args[0]).toEqual("test");
			expect(valueObservable.notify.mostRecentCall.args[1]).toBeUndefined();
			expect(valueObservable.notify.mostRecentCall.args[2]).toEqual("added");
		});
		
		it("should notify with new value on update", function () {
			spyOn(valueObservable, "notify");

			store.set("test");
			store.set("test", "newValue");
			expect(valueObservable.notify.wasCalled).toEqual(true);
			expect(valueObservable.notify.mostRecentCall.args[0]).toEqual("test");
			expect(valueObservable.notify.mostRecentCall.args[1]).toEqual("newValue");
			expect(valueObservable.notify.mostRecentCall.args[2]).toEqual("updated");
		});
		
		it("should provide value when said available", function () {
			var callback = function () {
				callback.ret = store.get("test");
			};
			store.watchValue("test", callback);
			store.set("test", "yes");
			
			expect(callback.ret).toEqual("yes");
		});
		
		it("should notify on del", function () {
			spyOn(valueObservable, "notify");

			store.set("test");
			store.del("test");
			expect(valueObservable.notify.wasCalled).toEqual(true);
			expect(valueObservable.notify.mostRecentCall.args[0]).toEqual("test");
			expect(valueObservable.notify.mostRecentCall.args[1]).toBeUndefined();
			expect(valueObservable.notify.mostRecentCall.args[2]).toEqual("deleted");
		});
		
		it("can unwatch value", function () {
			spyOn(valueObservable, "unwatch");

			handler = store.watchValue("added", function(){});
			store.unwatchValue(handler);
			
			expect(valueObservable.unwatch.wasCalled).toEqual(true);
			expect(valueObservable.unwatch.mostRecentCall.args[0]).toBe(handler);
		});

		
	});
	
	describe("StoreInit", function () {
		it("can be initialized with an object", function () {
			var func = function () {};
			
			var store = new Store({x: 10, y: 20, z:func});
			expect(store.get("x")).toEqual(10);
			expect(store.get("y")).toEqual(20);
			expect(store.get("z")).toEqual(func);
		});
		
		it("can be initialized with an array", function () {
			var store = new Store([1, 2, "yes"]);
			expect(store.get(0)).toEqual(1);
			expect(store.get(1)).toEqual(2);
			expect(store.get(2)).toEqual("yes");
		});
		
	});
	
	describe("StoreLength", function () {
		
		var store = null;
		
		beforeEach(function () {
			store = new Store();
		});
		
		it("should return the right number of items", function () {
			expect(store.getNbItems()).toEqual(0);
			store.set("value1");
			expect(store.getNbItems()).toEqual(1);
			store.set("value2");
			store.set("value3");
			expect(store.getNbItems()).toEqual(3);
			store.del("value3");
			expect(store.getNbItems()).toEqual(2);
			store.del("value2");
			store.del("value1");
			store.del("test");
			expect(store.getNbItems()).toEqual(0);
		});
		
		it("should return the right number of items when init with data", function () {
			var initValue = {x:10, y: 20},
				store = new Store(initValue);
			
			expect(store.getNbItems()).toEqual(2);
		});	
	});
	
	describe("StoreLoop", function () {
		
		var store = null,
			data = {
				"key1": "value1",
				"key3": 3,
				"key2": {}
			};
		
		beforeEach(function () {
			store = new Store(data);
		});
		
		it("should allow for looping through it", function () {
			expect(store.loop).toBeInstanceOf(Function);
			store.loop(function (val, idx) {
				expect(store.get(idx)).toEqual(val);
			});
		});
		
		it("should allow for looping in a given scope", function () {
			var thisObj = {},
				funcThisObj = null;
			store.loop(function () {
				funcThisObj = this;
			}, thisObj);
			
			expect(funcThisObj).toBe(thisObj);
		});
		
	});
	
	describe("StoreOrdered", function () {
		var store = null;
		
		beforeEach(function () {
			store = new Store([0, 1, 2, 3]);
		});
		
		it("should be working with arrays as data", function () {
			expect(store.get(0)).toEqual(0);
			expect(store.get(3)).toEqual(3);
			expect(store.getNbItems()).toEqual(4);
		});
		
		it("should be updatable", function () {
			expect(store.set(0, 10)).toEqual(true);
			expect(store.get(0)).toEqual(10);
		});
		
		it("should loop in the correct order", function () {
			var i = 0;
			store.loop(function (val, idx) {
				expect(idx).toEqual(i++);
			});
		});
		
	});
	
	
	describe("StoreAlteration", function () {
		var store = null,
			initialData = null;
		
		beforeEach(function () {
			initialData = [0, 1, 2, 3];
			store = new Store(initialData);
		});
		
		it("should give access to Array's functions", function () {
			spyOn(Array.prototype, "pop").andCallThrough();
			spyOn(Array.prototype, "sort").andCallThrough();
			spyOn(Array.prototype, "splice").andCallThrough();
			store.alter("pop");
			store.alter("sort");
			store.alter("splice", 1, 2);
			expect(Array.prototype.pop.wasCalled).toEqual(true);
			expect(Array.prototype.sort.wasCalled).toEqual(true);
			expect(Array.prototype.splice.wasCalled).toEqual(true);
			expect(Array.prototype.splice.mostRecentCall.args[0]).toEqual(1);
			expect(Array.prototype.splice.mostRecentCall.args[1]).toEqual(2);
		});
		
		it("should advertise on changes", function () {
			var spy1 = jasmine.createSpy(),
				spy2 = jasmine.createSpy();
			
			store.watch("updated", spy1);
			store.watch("deleted", spy2);
			
			store.alter("splice", 1, 2);

			expect(spy1.wasCalled).toEqual(true);
			expect(spy2.wasCalled).toEqual(true);
			expect(spy1.callCount).toEqual(1);
			expect(spy2.callCount).toEqual(2);
			expect(spy1.mostRecentCall.args[0]).toEqual(1);
			expect(spy1.mostRecentCall.args[1]).toEqual(3);
			spy2.calls.forEach(function (call) {
				// Don't know how to write this test better
				//  call.args[0] should equal 2 or 3
				expect(call.args[0] >= 2).toEqual(true);
				expect(call.args[1]).toBeUndefined();
			});
		});

		it("should return false if the function doesn't exist", function () {
			expect(store.alter("doesn't exist")).toEqual(false);
		});
		
		
		it("should call Array.splice on del if init'd with an array", function () {
			store.reset([0, 1, 2, 3]);
			spyOn(Array.prototype, "splice").andCallThrough();
			expect(store.del(1)).toEqual(true);
			expect(Array.prototype.splice.wasCalled).toEqual(true);
			expect(Array.prototype.splice.mostRecentCall.args[0]).toEqual(1);
			expect(Array.prototype.splice.mostRecentCall.args[1]).toEqual(1);
			expect(store.get(0)).toEqual(0);
			expect(store.get(1)).toEqual(2);
		});
		
		it("should notify only once on del", function () {
			var spy = jasmine.createSpy();
			store.reset([0, 1, 2, 3]);
			store.watch("deleted", spy);
			store.del(1);
			expect(spy.callCount).toEqual(1);
		});
		
	});

	
	describe("StoreReset", function () {
		var store = null,
			initialData = {a:10},
			resetData = {b:20};
		
		beforeEach(function () {
			store = new Store(initialData);
		});
		
		it("should allow for complete data reset", function () {
			expect(store.reset).toBeInstanceOf(Function);
			expect(store.reset(resetData)).toEqual(true);
			expect(store.has("a")).toEqual(false);
			expect(store.get("b")).toEqual(20);
		});
		
		it("should only reset if data is object or array", function () {
			expect(function () {
				store.reset();
			}).not.toThrow();
			
			expect(store.reset()).toEqual(false);
			expect(store.get("a")).toEqual(10);
		});
		
		it("should advertise for every modified value", function () {
			var spyA = jasmine.createSpy(),
				spyB = jasmine.createSpy();
			
			store.watch("deleted", spyA);
			store.watch("added", spyB);
			store.reset(resetData);
			expect(spyA.wasCalled).toEqual(true);
			expect(spyA.mostRecentCall.args[0]).toEqual("a")
			expect(spyA.mostRecentCall.args[1]).toBeUndefined();
			expect(spyA.callCount).toEqual(1);
			expect(spyB.mostRecentCall.args[0]).toEqual("b");
			expect(spyB.mostRecentCall.args[1]).toEqual(20);
			expect(spyB.callCount).toEqual(1);
		});
	});
	
	describe("StoreIsolation", function () {
		
		var dataSet = null,
			store1 = null,
			store2 = null;
		
		beforeEach(function () {
			dataSet = {a: 10, b: 20};
			store1 = new Store(dataSet);
			store2 = new Store(dataSet);
		});
		
		it("shouldn't share data sets that are identical", function () {
			store1.set("shared", "yes");
			expect(store2.get("shared")).toBeUndefined();
		});
		
		it("shouldn't share observers", function () {
			var spyAdded = jasmine.createSpy(),
				spyUpdated = jasmine.createSpy();
			
			store1.watch("added", spyAdded);
			store2.set("shared");
			expect(spyAdded.wasCalled).toEqual(false);
			expect(spyUpdated.wasCalled).toEqual(false);
		});
		
		it("should have the same behaviour on reset", function () {
			store1.reset(dataSet);
			store2.reset(dataSet);
			store1.set("shared", "yes");
			expect(store2.get("shared")).toBeUndefined();

			var spyAdded = jasmine.createSpy(),
			spyUpdated = jasmine.createSpy();
		
			store1.watch("added", spyAdded);
			store2.set("shared");
			expect(spyAdded.wasCalled).toEqual(false);
			expect(spyUpdated.wasCalled).toEqual(false);
		});

	});
});