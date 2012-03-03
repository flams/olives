/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

/**
 * Tested with the following _design/doc
 * views: {
 * 	view: 	{
 * 		map: function(doc) {
 * 				emit(doc.date, {date:doc.date, title:doc.title, body:doc.body});
 * 			}
 * 		}
 * 	}
 */

require(["CouchDBStore", "Store", "Promise"], function (CouchDBStore, Store, Promise) {
	
	var transportMock = null;
	
	beforeEach(function () {
		transportMock = {
				listen: jasmine.createSpy("listen"),
				request: jasmine.createSpy("request")
			};
	});
	
	describe("CouchDBStoreTest", function () {

		var couchDBStore = new CouchDBStore;
		
		it("should be a constructor function", function () {
			expect(CouchDBStore).toBeInstanceOf(Function);
		});

		it("should inherit from Store", function () {
			expect(Object.getPrototypeOf(couchDBStore)).toBeInstanceOf(Store);
		});
	});
	
	describe("CouchDBStoreTransport", function () {
		it("should have a function to set the transport", function () {
			var couchDBStore = new CouchDBStore;
			
			expect(couchDBStore.setTransport).toBeInstanceOf(Function);
			expect(couchDBStore.setTransport()).toEqual(false);
			expect(couchDBStore.setTransport(transportMock)).toEqual(true);
		});
		
		it("should have a function to get the transport", function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
			expect(couchDBStore.getTransport).toBeInstanceOf(Function);
			expect(couchDBStore.getTransport()).toBe(transportMock);
		});
	});
	
	/**
	 * A couchDB Store can synchronize with a view
	 * A view is a list of documents
	 */
	describe("CouchDBStoreSyncView", function () {
		
		var couchDBStore = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
		});
		
		it("should have a function to get its current state", function () {
			expect(couchDBStore.getStateMachine).toBeInstanceOf(Function);
			expect(couchDBStore.getStateMachine().getCurrent()).toEqual("Unsynched");
		});
		
		it("should have a function to synchronize with a couchdb view", function () {
			expect(couchDBStore.sync).toBeInstanceOf(Function);
			expect(couchDBStore.sync("no")).toEqual(false);
			expect(couchDBStore.sync("no", true)).toEqual(false);
			expect(couchDBStore.sync("yes", "no", false)).toEqual(false);
			expect(couchDBStore.sync("yes", "yes", "yes")).toBeInstanceOf(Promise);
		});
		
		it("should call Transport to issue the sync request", function () {
			var reqData;
			
			couchDBStore.sync("db", "design", "view"),
			expect(transportMock.request).toHaveBeenCalled();
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/_design/design/_view/view?update_seq=true");
		});
		
		it("should populate the store on sync and notify", function () {
			var res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
	            spy = jasmine.createSpy();
			
			transportMock.request = function (channel, reqData, callback, scope) {
				callback.call(scope, res);
			};
			
			couchDBStore.watch("added", spy);

			couchDBStore.sync("db", "design", "view");
			expect(spy.callCount).toEqual(3);
			expect(couchDBStore.getNbItems()).toEqual(3);
			expect(couchDBStore.get(0).value.date).toEqual("2012/01/13 12:45:56");
			expect(couchDBStore.get(2).value.title).toEqual("the 3rd document");
			
			expect(couchDBStore.getDBInfo).toBeInstanceOf(Function);
			expect(couchDBStore.getDBInfo("update_seq")).toEqual(8);
			expect(couchDBStore.getDBInfo("total_rows")).toEqual(3);
			expect(couchDBStore.getDBInfo("offset")).toEqual(0);
		});
		
		
		/**it("should call the promise resolution on sync", function () {
			var res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
				'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
				'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
				'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
			    promise,
			    asyncRequest;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res);
				};
			};

			promise = couchDBStore.sync("db", "design", "view");
			spyOn(promise, "resolve");
			asyncRequest();
			
			expect(promise.resolve.wasCalled).toEqual(true);
			expect(promise.resolve.mostRecentCall.args[0]).toEqual(couchDBStore);

		});*/
		
		it("should subscribe to changes", function () {
			
			var res =  '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
				'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
				'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
				'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
	            asyncRequest;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res);
				};
			};
			
			transportMock.listen = jasmine.createSpy();

			couchDBStore.sync("db", "desgin", "view");
			asyncRequest();
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1]).toEqual("/db/_changes?feed=continuous&heartbeat=20000&since=8");
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			
		});
		
		it("should not fail with empty json from heartbeat", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}'
				},
				asyncRequest,
				asyncListen,
				listenRes = '\n';

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes[reqData.path]);
					};
				};
	
				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};
				
				spyOn(transportMock, "request").andCallThrough();

				couchDBStore.sync("db", "design", "view");
				asyncRequest();
				expect(function() {
					asyncListen();
				}).not.toThrow();

		});
		
		it("should reflect changes and resolve the sync promise", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":3,"update_seq":8,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' + 
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"for the example"}}]}',
				'/db/_design/design/_view/view' : '{"total_rows":3,"offset":0,"rows":[' +
					'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
					'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
					'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}'                                                                                    	            
				},
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":9,"id":"document3","changes":[{"rev":"2-4f2957d984aa9d94d4298407f3292a47"}]}',
				spy = jasmine.createSpy(),
				promise;

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes[reqData.path]);
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};
			

			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("updated", spy);
			promise = couchDBStore.sync("db", "design", "view");
			spyOn(promise, "resolve");
			asyncRequest();
			expect(couchDBStore.getStateMachine().getCurrent()).toEqual("Listening");
			expect(promise.resolve.wasCalled).toEqual(true);
			expect(promise.resolve.mostRecentCall.args[0]).toBe(couchDBStore);
			asyncListen();
			asyncRequest();
			expect(spy.wasCalled).toEqual(true);
			expect(spy.mostRecentCall.args[0]).toEqual(2);
			expect(spy.mostRecentCall.args[1].value.title).toEqual("the 3rd document");
		});
		
		it("should add new items", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":3,"update_seq":9,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}}]}',
				'/db/_design/design/_view/view':'{"total_rows":4,"offset":0,"rows":[' +
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' +
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}},' +
						'{"id":"document4","key":"2012/01/13 23:37:12","value":{"date":"2012/01/13 23:37:12","title":"the 4th\'s just been added","body":"do you see me?"}}]}'                                                                                  	            
				},
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":10,"id":"document4","changes":[{"rev":"1-5a99f185bc942f626934108bd604bb33"}]}',
				spy = jasmine.createSpy();

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes[reqData.path]);
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("added", spy);
			couchDBStore.sync("db", "design", "view");
			asyncRequest();
			expect(couchDBStore.getStateMachine().getCurrent()).toEqual("Listening");
			asyncListen();
			asyncRequest();
			expect(spy.wasCalled).toEqual(true);
			expect(spy.callCount).toEqual(4);
			expect(spy.mostRecentCall.args[0]).toEqual(3);
			expect(spy.mostRecentCall.args[1].value.title).toEqual("the 4th\'s just been added");
		});
		
		it("should remove deleted items", function () {
			var requestRes = {
					'/db/_design/design/_view/view?update_seq=true': '{"total_rows":4,"update_seq":10,"offset":0,"rows":[' + 
						'{"id":"document1","key":"2012/01/13 12:45:56","value":{"date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}},' + 
						'{"id":"document2","key":"2012/01/13 13:45:21","value":{"date":"2012/01/13 13:45:21","title":"this is a new document","body":"in the database"}},' +
						'{"id":"document3","key":"2012/01/13 21:45:12","value":{"date":"2012/01/13 21:45:12","title":"the 3rd document","body":"a change for the example"}},' +
						'{"id":"document4","key":"2012/01/13 23:37:12","value":{"date":"2012/01/13 23:37:12","title":"the 4th\'s just been added","body":"do you see me?"}}]}'                                                                          	            
				},
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":11,"id":"document4","changes":[{"rev":"2-36ec9b80dce993a4a6a9ee311d266807"}],"deleted":true}',
				spy = jasmine.createSpy();

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes[reqData.path]);
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("deleted", spy);
			couchDBStore.sync("db", "design", "view");
			asyncRequest();
			asyncListen();
			expect(spy.wasCalled).toEqual(true);
			expect(spy.callCount).toEqual(1);
			expect(spy.mostRecentCall.args[0]).toEqual(3);
			expect(spy.mostRecentCall.args[1]).toBeUndefined();
			expect(couchDBStore.get(4)).toBeUndefined();
		});
	});
	
	/**
	 * A couchDBstore can synchronize with a document
	 * A document is a JSON object
	 */
	describe("CouchDBStoreSyncDocument", function () {
		
		var couchDBStore = null;
		
		beforeEach(function () {
			couchDBStore = new CouchDBStore;
			couchDBStore.setTransport(transportMock);
		});
		
		it("should have a function to synchronize with a couchdb document", function () {
			expect(couchDBStore.sync).toBeInstanceOf(Function);
			expect(couchDBStore.sync("no")).toEqual(false);
			expect(couchDBStore.sync("no", true)).toEqual(false);
			expect(couchDBStore.sync("yes", "yes")).toBeInstanceOf(Promise);
		});
		
		it("should call Transport to issue the sync request", function () {
			var reqData; 
			
			couchDBStore.sync("db", "document1");
			expect(transportMock.request).toHaveBeenCalled();
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			
			reqData = transportMock.request.mostRecentCall.args[1];
			expect(reqData).toBeInstanceOf(Object);
			expect(reqData["method"]).toEqual("GET");
			expect(reqData["path"]).toEqual("/db/document1");
		});
		
		it("should populate the store on sync and notify", function () {
			var res =  '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
	            spy = jasmine.createSpy(),
	            asyncRequest;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res);
				};
			};
			
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.watch("added", spy);
			couchDBStore.sync("db", "document1");
			asyncRequest();
			expect(spy.callCount).toEqual(5);
			expect(couchDBStore.getNbItems()).toEqual(5);
			expect(couchDBStore.get("_id")).toEqual("document1");
			expect(couchDBStore.get("_rev")).toEqual("1-7f5175756a7ab72660278c3c0aed2eee");
		});
		
		it("should call the promise rejection on sync if document doesn't exist", function () {
			var asyncRequest,
				res = {
					'/db/document4' : '{"error":"not_found","reason":"missing"}'
				},
				promise;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res[reqData.path]);
				};
			};
	
			promise = couchDBStore.sync("db", "document4");
			spyOn(promise, "reject");
			asyncRequest();
			
			expect(promise.reject.wasCalled).toEqual(true);
			expect(promise.reject.mostRecentCall.args[0]).toEqual(couchDBStore);
		});
		
		it("should subscribe to changes", function () {
			
			var res =  '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
	            asyncRequest;
			
			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res);
				};
			};
			
			transportMock.listen = jasmine.createSpy();

			couchDBStore.sync("db", "document1");
			asyncRequest();
			expect(transportMock.listen.wasCalled).toEqual(true);
			expect(transportMock.listen.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.listen.mostRecentCall.args[1]).toEqual("/db/_changes?feed=continuous&heartbeat=20000");
			expect(transportMock.listen.mostRecentCall.args[2]).toBeInstanceOf(Function);
			
		});
		
		it("should not fail with empty json from heartbeat", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
				asyncRequest,
				asyncListen,
				listenRes = '\n';

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};
	
				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				couchDBStore.sync("db", "design", "view");
				asyncRequest();
				expect(function() {
					asyncListen();
				}).not.toThrow();
		});
		
		it("should reflect changes and resolve the sync promise", function () {
			var requestRes = ['{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
							'{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}'],
				asyncRequest,
				asyncListen,
				listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}',
				spy1 = jasmine.createSpy(),
				spy2 = jasmine.createSpy(),
				promise;

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes.shift());
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};

			couchDBStore.watch("updated", spy1);
			couchDBStore.watch("added", spy2);
			promise = couchDBStore.sync("db", "document1");
			spyOn(promise, "resolve");
			asyncRequest();
			asyncListen();

			expect(promise.resolve.wasCalled).toEqual(true);
			expect(promise.resolve.mostRecentCall.args[0]).toBe(couchDBStore);
			
			asyncRequest();
			expect(spy1.wasCalled).toEqual(true);
			// _rev and title have been updated
			expect(spy1.callCount).toEqual(2);
			expect(spy1.mostRecentCall.args[0]).toEqual("title");
			expect(spy1.mostRecentCall.args[1]).toEqual("was my first document");
			expect(spy2.wasCalled).toEqual(true);
			// The first 5, then the newfield
			expect(spy2.callCount).toEqual(6);
			expect(spy2.mostRecentCall.args[0]).toEqual("newfield");
			expect(spy2.mostRecentCall.args[1]).toEqual("safe");
		});
		
		it("should update the database on update", function () {
			var requestRes = ['{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
								'{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}'],
					asyncRequest,
					asyncListen,
					stateMachine = couchDBStore.getStateMachine(),
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}';

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes.shift());
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};

			spyOn(stateMachine, "event").andCallThrough();
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.sync("db", "document1");
			asyncRequest();
			asyncListen();
			asyncRequest();
				
			expect(couchDBStore.update).toBeInstanceOf(Function);
			couchDBStore.set("title", "my first update");
			
			expect(couchDBStore.update()).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateDatabase");
			expect(transportMock.request.mostRecentCall.args[1].method).toEqual("PUT");
			expect(transportMock.request.mostRecentCall.args[1].path).toEqual("/db/document1");
			expect(transportMock.request.mostRecentCall.args[1].headers["Content-Type"]).toEqual("application/json");
			json = JSON.parse(transportMock.request.mostRecentCall.args[1].data);
			expect(json.title).toEqual("my first update");
			expect(json._rev).toEqual("2-0b77a81676739718c23c72a12a131986");
			expect(json.body).toEqual("in this database");
			
		});
		
		it("should not get changes when another document is updated", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
					asyncRequest,
					asyncListen,
					listenRes = '{"seq":12,"id":"document5","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}';

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};

				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				spyOn(transportMock, "request").andCallThrough();
				couchDBStore.sync("db", "document1");
				asyncRequest();
				asyncListen();
				asyncRequest();
				
				expect(transportMock.request.callCount).toEqual(1);
				
		});
		
		it("should not get changes if the rev is the same", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
					asyncRequest,
					asyncListen,
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"1-7f5175756a7ab72660278c3c0aed2eee"}]}';

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};

				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				spyOn(transportMock, "request").andCallThrough();
				couchDBStore.sync("db", "document1");
				asyncRequest();
				asyncListen();
				asyncRequest();
				
				expect(transportMock.request.callCount).toEqual(1);
				
		});
		
		it("should not get changes if document is deleted", function () {
			var requestRes = '{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
					asyncRequest,
					asyncListen,
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}], "deleted": true}',
					spy = jasmine.createSpy();

				transportMock.request = function (channel, reqData, callback, scope) {
					asyncRequest = function () {
						callback.call(scope, requestRes);
					};
				};

				transportMock.listen = function (channel, path, callback, scope) {
					asyncListen = function () {
						callback.call(scope, listenRes);
					};
				};

				couchDBStore.watch("deleted", spy);
				spyOn(transportMock, "request").andCallThrough();
				couchDBStore.sync("db", "document1");
				asyncRequest();
				asyncListen();
				asyncRequest();
				
				expect(transportMock.request.callCount).toEqual(1);
				expect(spy.callCount).toEqual(5);
				
		});
		
		it("should add document on update if it's missing", function () {
			var asyncRequest,
				res = {
						'/db/document4' : '{"error":"not_found","reason":"missing"}'
					},
				model = {
					title: "Emily is funky",
					body: "it's easy to use",
					date: "2012/01/30"
				};
				stateMachine = couchDBStore.getStateMachine();

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, res[reqData.path]);
				};
			};

			couchDBStore.sync("db", "document4");
			spyOn(transportMock, "request").andCallThrough();
			spyOn(stateMachine, "event").andCallThrough();
			asyncRequest();
			
			expect(couchDBStore.get("error")).toBeUndefined();
			expect(couchDBStore.get("reason")).toBeUndefined();
			expect(stateMachine.getCurrent()).toEqual("Synched");
			
			couchDBStore.reset(model);
			
			couchDBStore.update();
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("updateDatabase");
			
			expect(transportMock.request.mostRecentCall.args[0]).toEqual("CouchDB");
			expect(transportMock.request.mostRecentCall.args[1].method).toEqual("PUT");
			expect(transportMock.request.mostRecentCall.args[1].path).toEqual('/db/document4');
			expect(transportMock.request.mostRecentCall.args[1].headers["Content-Type"]).toEqual("application/json");
			expect(JSON.parse(transportMock.request.mostRecentCall.args[1].data).body).toBe("it's easy to use");
			asyncRequest();
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("subscribeToDocumentChanges");

			
		});
		
		it("should remove a document from the database", function () {
			var requestRes = ['{"_id":"document1","_rev":"1-7f5175756a7ab72660278c3c0aed2eee","date":"2012/01/13 12:45:56","title":"my first document","body":"in this database"}',
								'{"_id":"document1","_rev":"2-0b77a81676739718c23c72a12a131986","date":"2012/01/13 12:45:56","title":"was my first document","body":"in this database","newfield":"safe"}'],
					asyncRequest,
					asyncListen,
					stateMachine = couchDBStore.getStateMachine(),
					listenRes = '{"seq":12,"id":"document1","changes":[{"rev":"2-0b77a81676739718c23c72a12a131986"}]}';

			transportMock.request = function (channel, reqData, callback, scope) {
				asyncRequest = function () {
					callback.call(scope, requestRes.shift());
				};
			};

			transportMock.listen = function (channel, path, callback, scope) {
				asyncListen = function () {
					callback.call(scope, listenRes);
				};
			};

			spyOn(stateMachine, "event").andCallThrough();
			spyOn(transportMock, "request").andCallThrough();
			couchDBStore.sync("db", "document1");
			asyncRequest();
			asyncListen();
			asyncRequest();
				
			expect(couchDBStore.remove).toBeInstanceOf(Function);
			
			expect(couchDBStore.remove()).toEqual(true);
			expect(stateMachine.event.mostRecentCall.args[0]).toEqual("removeFromDatabase");
			expect(transportMock.request.mostRecentCall.args[1].method).toEqual("DELETE");
			expect(transportMock.request.mostRecentCall.args[1].path).toEqual("/db/document1?rev=2-0b77a81676739718c23c72a12a131986");
		});
		
		
	});
	
});