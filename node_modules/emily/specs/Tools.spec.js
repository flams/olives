/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

var __Global = this;

require(["Tools"], function (Tools) {
	
	describe("ToolsTestGetGlobal", function () {
		
		it("should get global object", function () {
			expect(Tools.getGlobal).toBeInstanceOf(Function);
			expect(Tools.getGlobal()).toBe(__Global);
		});
		
	});
	
	describe("ToolsTestMixin", function () {
		
		var source = {}, 
			destination = {};
		
		beforeEach(function () {
			destination = {a: 10, b: 20};
			source = function () { this.b=30; this.c=40;};
			source.prototype.d = 50;
			source = new source;
		});
		
		it("should be a function", function () {
			expect(Tools.mixin).toBeInstanceOf(Function);
		});
		
		it("should mix source into destination", function () {
			Tools.mixin(source, destination);
			expect(source.b).toEqual(destination.b);
			expect(destination.b).toEqual(30);
			expect(source.c).toEqual(destination.c);
		});
		
		it("should mix source into destination without overriding", function () {
			Tools.mixin(source, destination, true);
			expect(source.b).not.toEqual(destination.b);
			expect(destination.b).toEqual(20);
			expect(source.c).toEqual(destination.c);
		});
		
		it("should'nt mix in values from the proto chain", function () {
			Tools.mixin(source, destination);
			expect(destination.d).toBeUndefined();
		});
		
		it("should also return the destination", function () {
			expect(Tools.mixin(source, destination)).toBe(destination);
		});
	});
	
	describe("ToolsTestCount", function () {
		
		var object = function () { this.a=10; this.b=20;};
			object.prototype.c = 30;
			object = new object;
			
		it("should be a function", function () {
			expect(Tools.count).toBeInstanceOf(Function);
		});
		
		it("should count the number of items", function () {
			expect(Tools.count(object)).toEqual(2);
		});
		
	});
	
	describe("ToolsTestCompareObjects", function () {
		var o1 = {a: 1, c:3, b:4, x:10},
			o2 = {a: 2, b:52, c:4, x:100},
			o3 = {a: 5, b: 3, x: 50};
		
		it("should be a function", function () {
			expect(Tools.compareObjects).toBeInstanceOf(Function);
		});
		
		it("should return true if objects have the same own properties", function () {
			expect(Tools.compareObjects(o1, o2)).toEqual(true);
			expect(Tools.compareObjects(o2, o3)).toEqual(false);
		});
	});
	
	describe("ToolsTestToArray", function () {
		
		it("should be a function", function () {
			expect(Tools.toArray).toBeInstanceOf(Function);
		});
		
		if (__Global.document) {
			it("should transform nodes lists to an array if running in browser", function () {
				var ul = document.createElement("ul"),
				nodeList = ul.querySelectorAll("ul"),
				array = null;
			
		
				ul.innerHTML = "<li>hel</li><li>lo</li>";
				
				expect(nodeList).toBeInstanceOf(NodeList);
				array = Tools.toArray(nodeList);
				expect(array).toBeInstanceOf(Array);
				expect(nodeList[0]).toBe(array[0]);
				expect(nodeList[1]).toBe(array[1]);
			});
		}
		
		it("should transform arguments to an array", function () {
			var args = (function (a,b) {return arguments;})(1,2),
				array = Tools.toArray(args);
			expect(array).toBeInstanceOf(Array);
			expect(args[0]).toBe(array[0]);
			expect(args[1]).toBe(array[1]);
		});
		
	});
	
	describe("ToolsTestLoop", function () {
		
		var object = {
				a: 2,
				e: 15,
				b: 0,
				c: 1,
				d: 2
			},
			array = [2,0,1,2];
		
		
		it("should be a function", function () {
			expect(Tools.loop).toBeInstanceOf(Function);
		});
		
		it("should execute only with correct parameters", function () {
			expect(Tools.loop()).toEqual(false);
			expect(Tools.loop("")).toEqual(false);
			expect(Tools.loop(null)).toEqual(false);
			expect(Tools.loop({}), "").toEqual(false);
			expect(Tools.loop([], [])).toEqual(false);
			expect(Tools.loop([], function(){})).toEqual(true);
		});
		
		it("should iterate through arrays", function () {
			var spy = jasmine.createSpy();
			expect(Tools.loop(array, spy)).toEqual(true);
			expect(spy.calls[0].args[0]).toEqual(2);
			expect(spy.calls[0].args[1]).toEqual(0);
			
			expect(spy.calls[1].args[0]).toEqual(0);
			expect(spy.calls[1].args[1]).toEqual(1);
			
			expect(spy.calls[2].args[0]).toEqual(1);
			expect(spy.calls[2].args[1]).toEqual(2);
			
			expect(spy.calls[3].args[0]).toEqual(2);
			expect(spy.calls[3].args[1]).toEqual(3);
			
			expect(spy.mostRecentCall.args[2]).toEqual(array);
		});
		
		it("should iterate through arrays in scope", function () {
			var spy = jasmine.createSpy(),
				thisObj = {};
			
			Tools.loop(array, spy, thisObj);
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should iterate through objects", function () {
			var spy = jasmine.createSpy();
			expect(Tools.loop(object, spy)).toEqual(true);
			expect(spy.callCount).toEqual(5);
			spy.calls.forEach(function (value, idx, call) {
				expect(object[call[idx].args[1]]).toEqual(call[idx].args[0]);
			});
			expect(spy.mostRecentCall.args[2]).toEqual(object);
		});
		
		it("should iterate through objects in scope", function () {
			var spy = jasmine.createSpy(),
				thisObj = {};
			
			Tools.loop(object, spy, thisObj);
			expect(spy.mostRecentCall.object).toBe(thisObj);
		});
		
		it("should iterate through nodelist", function () {
			if (typeof document != "undefined") {
				var dom = document.createElement("div"),
					spy = jasmine.createSpy();
				dom.innerHTML = "<p></p><p></p><p></p><p></p>";
				Tools.loop(dom.querySelectorAll("p"), spy);
				expect(spy.callCount).toEqual(4);
			}
		});
	});
	
	describe("ToolsTestObjectDiff", function () {
		
		it("should be a function", function () {
			expect(Tools.objectsDiffs).toBeInstanceOf(Function);
		});
		
		it("should take two objects as parameters", function () {
			expect(Tools.objectsDiffs("")).toEqual(false);
			expect(Tools.objectsDiffs([], "")).toEqual(false);
			expect(Tools.objectsDiffs("", {})).toEqual(false);
			expect(Tools.objectsDiffs({}, [])).toBeTruthy();
		});
		
		it("should return an object with changed/deleted info", function () {
			var result = Tools.objectsDiffs({}, {});
			expect(result).toBeInstanceOf(Object);
			expect(result.updated).toBeInstanceOf(Array);
			expect(result.unchanged).toBeInstanceOf(Array);
			expect(result.added).toBeInstanceOf(Array);
			expect(result.deleted).toBeInstanceOf(Array);
		});
		
		describe("ToolsTestDiffWithArray", function () {
			var initialArray = ["a", "b", "c", "d"],
				finalArray = ["a", "d", "e"];
			
			it("should return items that have changed or have been deleted", function () {
				var result = Tools.objectsDiffs(initialArray, finalArray);
				expect(result.updated.length).toEqual(2);
				expect(result.unchanged.length).toEqual(1);
				expect(result.added.length).toEqual(0);
				expect(result.deleted.length).toEqual(1);
				expect(result.updated.sort().join("")).toEqual([1, 2].sort().join(""));
				expect(result.unchanged[0]).toEqual(0);
				expect(result.deleted[0]).toEqual(3);
			});
			
			it("shouldn't have the same result if arrays are swapped", function () {
				var result = Tools.objectsDiffs(finalArray, initialArray);
				expect(result.added.length).toEqual(1);
				expect(result.added[0]).toEqual(3);
			});
		});
		
		describe("ToolsTestDiffWithObjects", function () {
			var initialObject = {a: 10, b: 20, c: 30},
				finalObject = {a:10, c: 40, d: 50};
			
			it("should return items that have changed or have been deleted", function () {
				var result = Tools.objectsDiffs(initialObject, finalObject);
				expect(result.updated.length).toEqual(1);
				expect(result.updated[0]).toEqual("c");
				expect(result.unchanged.length).toEqual(1);
				expect(result.unchanged[0]).toEqual("a");
				expect(result.deleted.length).toEqual(1);
				expect(result.deleted[0]).toEqual("b");
				expect(result.added.length).toEqual(1);
				expect(result.added[0]).toEqual("d");
			});
		});
		
		
	});
	
	describe("ToolsTestJsonify", function () {
		
		var func = function () {
				this.a = 1;
				this.b = function () {};
				this.d;
				this.e = null;
			},
			object = null,
			array = [1, 3];
			
		func.prototype.c = 3;
		object = new func;
			
		it("should be a function", function () {
			expect(Tools.jsonify).toBeInstanceOf(Function);
		});
		
		it("should return valid JSON", function () {
			var result = Tools.jsonify(object);
			expect(result).toBeInstanceOf(Object);
			expect(result["a"]).toEqual(1);
			expect(result["b"]).toBeUndefined();
			expect(result["c"]).toBeUndefined();
			expect(result["d"]).toBeUndefined();
		});
		
		it("should return a copy of the array", function () {
			var result = Tools.jsonify(array);
			expect(result).toBeInstanceOf(Array);
			expect(result).not.toBe(array);
			expect(result.length).toEqual(2);
			expect(result[0]).toEqual(1);
			expect(result[1]).toEqual(3);
		});
		
		it("should return false if not an object", function () {
			expect(Tools.jsonify("")).toEqual(false);
		});

	});
	
	describe("ToolsTestClone", function () {
		
		it("should be a function", function () {
			expect(Tools.clone).toBeInstanceOf(Function);
		});
		
		it("should make a copy of objects", function () {
			var object = {a:10, b:20},
				clone = Tools.clone(object);

			expect(Tools.count(clone)).toEqual(Tools.count(object));
			Tools.loop(clone, function (value, idx) {
				expect(clone[idx]).toEqual(object[idx]);
			});
			expect(clone).not.toBe(object);
		});
		
		it("should make a copy of arrays", function () {
			var array  = [1, 2, 3],
				copy = Tools.clone(array);
			
			expect(copy.length).toEqual(array.length);
			copy.forEach(function (value, idx) {
				expect(copy[idx]).toEqual(array[idx]);
			});
			expect(copy).not.toBe(array);
		});

		it("should return the rest", function () {
			var func = function () {},
				regExp = /o/;
		
			expect(Tools.clone("yes")).toEqual("yes");
			expect(Tools.clone(null)).toEqual(null);
			expect(Tools.clone(func)).toBe(func);
			expect(Tools.clone(regExp)).toBe(regExp);
			
		});
	});
	
	describe("ToolsGetNestedProperty", function () {

		var a = {b:{c:{d:{e:1}}}},
			b = [{c:{d:10}}];
		
		it("should be a function", function () {
			expect(Tools.getNestedProperty).toBeInstanceOf(Function);
		});
		
		it("should return the property value", function () {

			expect(Tools.getNestedProperty()).toBeUndefined();
			expect(Tools.getNestedProperty("")).toEqual("");
			expect(Tools.getNestedProperty("a.b.c.d.e")).toEqual("a.b.c.d.e");
			expect(Tools.getNestedProperty(true)).toEqual(true);
			expect(Tools.getNestedProperty(null)).toEqual(null);
			expect(Tools.getNestedProperty(a)).toEqual(a);
			expect(Tools.getNestedProperty(a.b)).toBe(a.b);
			expect(Tools.getNestedProperty(a.b, "")).toBe(a.b);
			expect(Tools.getNestedProperty(a, "b.c")).toBe(a.b.c);
			expect(Tools.getNestedProperty(a, "b.c.d.e")).toEqual(1);
			expect(Tools.getNestedProperty(a, "b")).toEqual(a.b);
			expect(Tools.getNestedProperty(a, "b.e")).toBeUndefined();
		});
		
		it("should get the property through an array too", function () {
			expect(Tools.getNestedProperty(b, "0.c.d")).toEqual(10);
		});
		
		it("should work with numbers as property", function () {
			expect(Tools.getNestedProperty(b, 0)).toEqual(b[0]);
		});

	});
	
	describe("ToolsSetNestedProperty", function () {
		
		var a = {b:{c:{d:{e:1}}}},
			b = [{c:{d:10}}];
		
		it("should be a function", function () {
			expect(Tools.setNestedProperty).toBeInstanceOf(Function);
		});
		
		it("should set the property value", function () {
			var obj = {};
			expect(Tools.setNestedProperty()).toBeUndefined();
			expect(Tools.setNestedProperty("")).toEqual("");
			expect(Tools.setNestedProperty(true)).toEqual(true);
			expect(Tools.setNestedProperty(null)).toEqual(null);
			expect(Tools.setNestedProperty(a)).toEqual(a);
			expect(Tools.setNestedProperty(a, "b.c.d.e", 2)).toEqual(2);
			expect(a.b.c.d.e).toEqual(2);
			expect(Tools.setNestedProperty(a, "b.c", obj)).toEqual(obj);
			expect(a.b.c).toEqual(obj);
		});
		
		it("should set the property through an array too", function () {
			expect(Tools.setNestedProperty(b, "0.c.d", 20)).toEqual(20);
			expect(b[0].c.d).toEqual(20);
		});
		
		it("should work with numbers as property", function () {
			expect(Tools.setNestedProperty(b, 0, 20)).toEqual(20);
			expect(b[0]).toEqual(20);
		});
	});

});