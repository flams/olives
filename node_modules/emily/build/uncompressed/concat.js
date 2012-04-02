/**
 * @license Emily
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 *//**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("CouchDBStore", 

["Store", "StateMachine", "Tools", "Promise"], 

/**
 * @class
 * CouchDBStore synchronises a Store with a CouchDB view or document
 * It subscribes to _changes to keep its data up to date.
 */
function CouchDBStore(Store, StateMachine, Tools, Promise) {
	
	/**
	 * Defines the CouchDBStore
	 * @returns {CouchDBStoreConstructor}
	 */
	function CouchDBStoreConstructor() {
		
		/**
		 * The name of the channel on which to run the requests
		 * @private
		 */
		var _channel = "CouchDB",
		
		/**
		 * The transport used to run the requests
		 * @private
		 */
		_transport = null,
		
		/**
		 * That will store the synchronization info
		 * @private
		 */
		_syncInfo = {},
		
		/**
		 * The promise that is returned by sync
		 * It's resolved when entering listening state
		 * It's rejected when no such document to sync to
		 * @private
		 */
		_syncPromise = new Promise(),
		
		/**
		 * All the actions performed by the couchDBStore
		 * They'll feed the stateMachine
		 * @private
		 */
		actions = {
			
			/**
			 * Get a CouchDB view
			 * @private
			 */
			getView: function () {

				_syncInfo.query = _syncInfo.query || {};
				_syncInfo.query.update_seq=true;
				
				_transport.request(_channel, {
					method: "GET",
					path: "/" + _syncInfo.database + "/_design/" + _syncInfo.design + "/" + "_view/" + _syncInfo.view,
					query: _syncInfo.query
				}, function (results) {
					var json = JSON.parse(results);
					if (!json.rows) {
						throw new Error("CouchDBStore [" + _syncInfo.database + ", " + _syncInfo.design + ", " + _syncInfo.view + "].sync() failed: " + results);	
					} else {
						this.reset(json.rows);
						_stateMachine.event("subscribeToViewChanges", json.update_seq);
					}
				}, this);
			},
			
			/**
			 * Get a CouchDB document
			 * @private
			 */
			getDocument: function () { 
				
				_transport.request(_channel, {
					method: "GET",
					path: "/" + _syncInfo.database + "/" + _syncInfo.document,
					query: _syncInfo.query
				}, function (results) {
					var json = JSON.parse(results);
					if (json._id) {
						this.reset(json);
						_stateMachine.event("subscribeToDocumentChanges");	
					} else {
						_syncPromise.reject(this);
					}
				}, this);
			},
			
			/**
			 * Get a bulk of documents
			 * @private
			 */
			getBulkDocuments: function () {
				
				_syncInfo.query = _syncInfo.query || {};
				_syncInfo.query.include_docs = true;
				_syncInfo.query.update_seq = true;
				
				_transport.request(_channel, {
					method: "POST",
					path: "/" + _syncInfo.database + "/_all_docs",
					query: _syncInfo.query,
					headers: {
						"Content-Type": "application/json"
					},
					data: JSON.stringify({keys:_syncInfo.bulkDoc})
				}, function (results) {
					var json = JSON.parse(results);
					if (!json.rows) {
						throw new Error("CouchDBStore [" + _syncInfo.database + ", " + JSON.stringify(_syncInfo.bulkDoc) + "].sync() failed: " + results);	
					} else {
						this.reset(json.rows);
						_stateMachine.event("subscribeToBulkChanges", json.update_seq);
					}
				}, this);
				
			},
			
			/**
			 * Put a new document in CouchDB
			 * @private
			 */
			createDocument: function (promise) {
            	_transport.request(_channel, {
            		method: "PUT",
            		path: '/' + _syncInfo.database + '/' + _syncInfo.document,
            		headers: {
            			"Content-Type": "application/json"
            		},
            		data: this.toJSON()
            	}, function (result) {
            		var json = JSON.parse(result);
            		if (json.ok) {
            			promise.resolve(json);
                		_stateMachine.event("subscribeToDocumentChanges");	
            		} else {
            			promise.reject(json);
            		}
            	});
            },
            
            /**
             * Subscribe to changes when synchronized with a view
             * @param {Number} the update_seq given by getView, it'll be passed to since in the GET request
             * @private
             */
            subscribeToViewChanges: function (update_seq) {
            	
            	Tools.mixin({
					feed: "continuous",
					heartbeat: 20000,
					since: update_seq
				}, _syncInfo.query);
            	
            	this.stopListening = _transport.listen(_channel, {
						path: "/" + _syncInfo.database + "/_changes",
						query: _syncInfo.query
					},
					function (changes) {
						// Should I test for this very special case (heartbeat?)
						// Or do I have to try catch for any invalid json?
						if (changes == "\n") {
							return false;
						}
						
						var json = JSON.parse(changes),
							action;

						if (json.deleted) {
							action = "delete";
						} else if (json.changes[0].rev.search("1-") == 0) {
							action = "add";
						} else {
							action = "change";
						}
						_stateMachine.event(action, json.id);
					}, this);
			},
			
			/**
			 * Subscribe to changes when synchronized with a document
			 * @private
			 */
			subscribeToDocumentChanges: function () {

				this.stopListening = _transport.listen(_channel, {
					path: "/" + _syncInfo.database + "/_changes",
					query: {
						 feed: "continuous",
						 heartbeat: 20000
						}
					},
				function (changes) {
					var json;
					// Should I test for this very special case (heartbeat?)
					// Or do I have to try catch for any invalid json?
					if (changes == "\n") {
						return false;
					}
					
					json = JSON.parse(changes);
					
					// The document is the modified document is the current one
					if (json.id == _syncInfo.document && 
						// And if it has a new revision
						json.changes.pop().rev != this.get("_rev")) {
						
						if (json.deleted) {
							_stateMachine.event("deleteDoc");
						} else {
							_stateMachine.event("updateDoc");	
						}
					 }
				}, this);
			},
			
			/**
			 * Subscribe to changes when synchronized with a bulk of documents
			 * @private
			 */
			subscribeToBulkChanges: function (update_seq) {
				Tools.mixin({
					feed: "continuous",
					heartbeat: 20000,
					since: update_seq
				}, _syncInfo.query);
            	
            	this.stopListening = _transport.listen(_channel, {
						path: "/" + _syncInfo.database + "/_changes",
						query: _syncInfo.query
					},
					function (changes) {
						var json;
						// Should I test for this very special case (heartbeat?)
						// Or do I have to try catch for any invalid json?
						if (changes == "\n") {
							return false;
						}
						
						var json = JSON.parse(changes),
							action;
						
						if (json.deleted) {
							action = "delete";
						} else {
							action = "bulkChange";
						}
						
						_stateMachine.event(action, json.id);
						
						
					}, this);
			},
			
			/**
			 * Update in the Store a document that was updated in CouchDB
			 * Get the whole view :(, then get the modified document and update it.
			 * I have no choice but to request the whole view and look for the document
			 * so I can also retrieve its position in the store (idx) and update the item.
			 * Maybe I've missed something
			 * @private
			 */
			updateDocInStore: function (id) {
				_transport.request(_channel,{
					method: "GET",
					path: '/'+_syncInfo.database+'/_design/'+_syncInfo.design+'/_view/'+_syncInfo.view,
					query: _syncInfo.query
				}, function (view) {
					var json = JSON.parse(view);
					
					json.rows.some(function (value, idx) {
						if (value.id == id) {
							this.set(idx, value);
						}
					}, this);

					
				}, this);
				
			},
			
			/**
			 * Update in the Store a document that was updated in CouchDB
			 * Get all documents like the first sync request, then get the modified document and update it.
			 * I'm doing this because the document, the things I really care for (the rest is plumbing)
			 * is sometimes stored into value (view) into doc (bulk docs) or as is.
			 * @private
			 */
			updateBulkDocInStore: function (id) {
				_transport.request(_channel, {
					method: "POST",
					path: "/"+_syncInfo.database+"/_all_docs",
					query: _syncInfo.query
				}, function (bulk) {
					var json = JSON.parse(bulk);
					
					json.rows.some(function (value, idx) {
						if (value.id == id) {
							this.set(idx, value);
						}
					}, this);
					
				});
			},
			
			/**
			 * Remove from the Store a document that was removed in CouchDB
			 * @private
			 */
			removeDocInStore: function (id) {
				this.loop(function (value, idx) {
					if (value.id == id) {
						this.del(idx);
					}
				}, this);
			},
			
			/**
			 * Add in the Store a document that was added in CouchDB
			 * @private
			 */
			addDocInStore: function (id) {
				_transport.request(_channel,{
					method: "GET",
					path: '/'+_syncInfo.database+'/_design/'+_syncInfo.design+'/_view/'+_syncInfo.view,
					query: _syncInfo.query
				}, function (view) {
					var json = JSON.parse(view);
					
					json.rows.some(function (value, idx) {
						if (value.id == id) {
							this.alter("splice", idx, 0, value);	
						}
					}, this);
					
				}, this);
			},
			
			/**
			 * Update the document when synchronized with a document.
			 * This differs than updating a document in a View
			 * @private
			 */
			updateDoc: function () {
				_transport.request(_channel, {
					method: "GET",
					path: '/'+_syncInfo.database+'/' + _syncInfo.document
				}, function (doc) {
					this.reset(JSON.parse(doc));			
				}, this);
		    },
		    
		    /**
		     * Delete all document's properties
		     * @private
		     */
		    deleteDoc: function () {
		    	this.reset({});			
		    },
		    
		    /**
		     * Update a document in CouchDB through a PUT request
		     * @private
		     */
		    updateDatabase: function (promise) {

		    	_transport.request(_channel, {
            		method: "PUT",
            		path: '/' + _syncInfo.database + '/' + _syncInfo.document,
            		headers: {
            			"Content-Type": "application/json"
            		},
            		data: this.toJSON()
            	}, function (response) {
            		var json = JSON.parse(response);
            		if (json.ok) {
            			promise.resolve(json);
            		} else {
            			promise.reject(json);
            		}
            	});
		    },
		    
		    /**
		     * Update the database with bulk documents
		     * @private
		     */
		    updateDatabaseWithBulkDoc: function (promise) {
		    	
		    	var docs = [];
		    	this.loop(function (value) {
		    		docs.push(value.doc);
		    	});
		    	
		    	_transport.request(_channel, {
		    		method: "POST",
		    		path: "/" + _syncInfo.database + "/_bulk_docs",
		    		headers: {
		    			"Content-Type": "application/json"
		    		},
		    		data: JSON.stringify({"docs": docs})
		    	}, function (response) {
		    		promise.resolve(JSON.parse(response));
            	});
		    },
		    
		    /**
		     * Remove a document from CouchDB through a DELETE request
		     * @private
		     */
		    removeFromDatabase: function () {
		    	_transport.request(_channel, {
            		method: "DELETE",
            		path: '/' + _syncInfo.database + '/' + _syncInfo.document,
            		query: {
            			rev: this.get("_rev")
            		}
            	});
		    },
		    
		    /**
		     * Resolve the promise
		     * @private
		     */
		    resolve: function () {
            	  _syncPromise.resolve(this);
             },
             
             /**
              * The function call to unsync the store
              * @private
              */
             unsync: function () {
            	 this.stopListening();
            	 delete this.stopListening;
             }
		},
		
		/**
		 * The state machine
		 * @private
		 * it concentrates almost the whole logic.
		 */
		_stateMachine = new StateMachine("Unsynched", {
			"Unsynched": [
			    ["getView", actions.getView, this, "Synched"],
				["getDocument", actions.getDocument, this, "Synched"],
				["getBulkDocuments", actions.getBulkDocuments, this, "Synched"]
			 ],
						
			"Synched": [
			    ["updateDatabase", actions.createDocument, this],
			    ["subscribeToViewChanges", actions.subscribeToViewChanges, this, "Listening"],
				["subscribeToDocumentChanges", actions.subscribeToDocumentChanges, this, "Listening"],
				["subscribeToBulkChanges", actions.subscribeToBulkChanges, this, "Listening"],
				["unsync", function noop(){}, "Unsynched"]
			 ],
				
			"Listening": [
			    ["entry", actions.resolve, this],
			    ["change", actions.updateDocInStore, this],
			    ["bulkChange", actions.updateBulkDocInStore, this],
				["delete", actions.removeDocInStore, this],
				["add", actions.addDocInStore, this],
				["updateDoc", actions.updateDoc, this],
			    ["deleteDoc", actions.deleteDoc, this],
			    ["updateDatabase", actions.updateDatabase, this],
			    ["updateDatabaseWithBulkDoc", actions.updateDatabaseWithBulkDoc, this],
			    ["removeFromDatabase", actions.removeFromDatabase, this],
			    ["unsync", actions.unsync, this, "Unsynched"]
			   ]
			
		});
		
		/**
		 * Synchronize the store with a view
		 * @param {String} database the name of the database where to get...
		 * @param {String} ...design the design document, in which...
		 * @param {String} view ...the view is.
		 * @returns {Boolean}
		 */
		this.sync = function sync() {
			if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "string") {
				this.setSyncInfo(arguments[0], arguments[1], arguments[2], arguments[3]);
				_stateMachine.event("getView");
				return _syncPromise;
			} else if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] != "string") {
				this.setSyncInfo(arguments[0], arguments[1], arguments[2]);
				_stateMachine.event("getDocument");
				return _syncPromise;
			} else if (typeof arguments[0] == "string" && arguments[1] instanceof Array) {
				this.setSyncInfo(arguments[0], arguments[1], arguments[2]);
				_stateMachine.event("getBulkDocuments");
				return _syncPromise;
			}
			return false;
		};
		
		/**
		 * Set the synchronization information
		 * @private
		 * @returns {Boolean}
		 */
		this.setSyncInfo = function setSyncInfo() {
			if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "string") {
				_syncInfo["database"] = arguments[0];
				_syncInfo["design"] = arguments[1];
				_syncInfo["view"] = arguments[2];
				_syncInfo["query"] = arguments[3];
				return true;
			} else if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] != "string") {
				_syncInfo["database"] = arguments[0];
				_syncInfo["document"] = arguments[1];
				_syncInfo["query"] = arguments[2];
				return true;
			} else if (typeof arguments[0] == "string" && arguments[1] instanceof Array) {
				_syncInfo["database"] = arguments[0];
				_syncInfo["bulkDoc"] = arguments[1];
				_syncInfo["query"] = arguments[2];
				return true;
			}
			return false;
		};
		
		/**
		 * Get the synchronization information
		 * @private
		 * @returns
		 */
		this.getSyncInfo = function getSyncInfo() {
			return _syncInfo;
		};
		
		/**
		 * Unsync a store. Unsync must be called prior to resynchronization.
		 * That will prevent any unwanted resynchronization.
		 * Notice that previous data will still be available.
		 * @returns
		 */
		this.unsync = function unsync() {
			return _stateMachine.event("unsync");
		};
		
		/**
		 * Upload the document to the database
		 * Works for CouchDBStore that are synchronized with documents or bulk of documents.
		 * If synchronized with a bulk of documents, you can set the documents to delete _deleted property to true.
		 * No modification can be done on views.
		 * @returns true if upload called
		 */
		this.upload = function upload() {
			var promise = new Promise;
			if(_syncInfo.document) {
				_stateMachine.event("updateDatabase", promise);
				return promise;
			} else if (_syncInfo.bulkDoc) {
				_stateMachine.event("updateDatabaseWithBulkDoc", promise);
				return promise;
			} 
			return false;
		};
		
		/**
		 * Remove the document from the database
		 * @returns true if remove called
		 */
		this.remove = function remove() {
			if (_syncInfo.document) {
				return _stateMachine.event("removeFromDatabase");
			} 
			return false;
		};
		
		/**
		 * The transport object to use
		 * @param {Object} transport the transport object
		 * @returns {Boolean} true if 
		 */
		this.setTransport = function setTransport(transport) {
			if (transport && typeof transport.listen == "function" && typeof transport.request == "function") {
				_transport = transport;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the state machine
		 * Also only useful for debugging
		 * @private
		 * @returns {StateMachine} the state machine
		 */
		this.getStateMachine = function getStateMachine() {
			return _stateMachine;
		};
		
		/**
		 * Get the current transport
		 * Also only useful for debugging
		 * @private
		 * @returns {Object} the current transport
		 */
		this.getTransport = function getTransport() {
			return _transport;
		};
		
		/**
		 * The functions called by the stateMachine made available for testing purpose
		 * @private
		 */
		this.actions = actions;

	};
	
	return function CouchDBStoreFactory() {
		CouchDBStoreConstructor.prototype = new Store;
		return new CouchDBStoreConstructor;
	};
	
});/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Observable",

["Tools"],
/** 
* @class 
* Observable is an implementation of the Observer design pattern, 
* which is also known as publish/subscribe.
* 
* This service creates an Observable on which you can add subscribers.
*/
function Observable(Tools) {
	
	/**
	 * Defines the Observable
	 * @private
	 * @returns {_Observable}
	 */
	return function ObservableConstructor() {

		/**
		 * The list of topics
		 * @private
		 */
		var _topics = {};
		
		/**
		 * Add an observer
		 * @param {String} topic the topic to observe
		 * @param {Function} callback the callback to execute
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns handler
		 */
		this.watch = function watch(topic, callback, scope) {
			if (typeof callback == "function") {
				var observers = _topics[topic] = _topics[topic] || [];
			
				observer = [callback, scope];
				observers.push(observer);
				return [topic,observers.indexOf(observer)];
				
			} else {
				return false;
			}
		};
		
		/**
		 * Remove an observer
		 * @param {Handler} handler returned by the watch method
		 * @returns {Boolean} true if there were subscribers
		 */
		this.unwatch = function unwatch(handler) {
			var topic = handler[0], idx = handler[1];
			if (_topics[topic] && _topics[topic][idx]) {
				// delete value so the indexes don't move
				delete _topics[topic][idx];
				// If the topic is only set with falsy values, delete it;
				if (!_topics[topic].some(function (value) {
					return !!value;
				})) {
					delete _topics[topic];
				}
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Notifies observers that a topic has a new message
		 * @param {String} topic the name of the topic to publish to
		 * @param subject
		 * @returns {Boolean} true if there was subscribers
		 */
		this.notify = function notify(topic) {
			
			var observers = _topics[topic],
				l;

			if (observers) {
				l = observers.length;
				while (l--) {
					observers[l] && observers[l][0].apply(observers[l][1] || null, Tools.toArray(arguments).slice(1)); 
				}
				return true;
			} else {
				return false;
			}
		},
		
		/**
		 * Check if topic has the described observer
		 * @param {Handler}
		 * @returns {Boolean} true if exists
		 */
		this.hasObserver = function hasObserver(handler) {
			return !!( handler && _topics[handler[0]] && _topics[handler[0]][handler[1]]);
		};
		
		/**
		 * Check if a topic has observers
		 * @param {String} topic the name of the topic
		 * @returns {Boolean} true if topic is listened
		 */
		this.hasTopic = function hasTopic(topic) {
			return !!_topics[topic];
		};
		
		/**
		 * Unwatch all or unwatch all from topic
		 * @param {String} topic optional unwatch all from topic
		 * @returns {Boolean} true if ok
		 */
		this.unwatchAll = function unwatchAll(topic) {
			if (_topics[topic]) {
				delete _topics[topic];
			} else {
				_topics = {};
			}
			return true;
		};
		
	};
	
});/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Promise",

["Observable", "StateMachine"],

/**
 * @class
 * Create a Promise
 */
function Promise(Observable, StateMachine) {
	
	return function PromiseConstructor() {
		/**
		 * The value once resolved
		 * @private
		 */
		var _resolved,
		
		/**
		 * The value once rejected
		 * @private
		 */
		_rejected,
		
		/**
		 * The stateMachine
		 * @private
		 */
		_stateMachine = new StateMachine("Unresolved", {
			"Unresolved": [["resolve", function (val) {
								_resolved = val;
								_observable.notify("success", val);
							}, "Resolved"],
							
							["reject", function (err) {
								_rejected = err;
								_observable.notify("fail", err);
							}, "Rejected"],
							
							["addSuccess", function (func, scope) {
								_observable.watch("success", func, scope);
							}],
							
							["addFail", function (func, scope) {
								_observable.watch("fail", func, scope);
							}]],
							
			"Resolved": [["addSuccess", function (func, scope) {
								func.call(scope, _resolved);
							}]],
							
			"Rejected": [["addFail", function (func, scope) {
								func.call(scope, _rejected);
							}]]
		}),
		
		/**
		 * The observable
		 * @private
		 */
		_observable = new Observable();
		
		/**
		 * Resolve the promise.
		 * A promise can be resolved only once.
		 * @param the resolution value
		 * @returns true if the resolution function was called
		 */
		this.resolve = function resolve(val) {
			return _stateMachine.event("resolve", val);
		};
		
		/**
		 * Reject the promise.
		 * A promise can be rejected only once.
		 * @param the rejection value
		 * @returns true if the rejection function was called
		 */
		this.reject = function reject(err) {
			return _stateMachine.event("reject", err);
		};
		
        /**
         * The callbacks and errbacks to call after resolution or rejection
         * @param {Function} the first parameter is a success function, it can be followed by a scope in which to run it
         * @param {Function} the second, or third parameter is an errback, it can also be followed by a scope
         * @examples:
         * 
         * then(callback)
         * then(callback, scope, errback, scope)
         * then(callback, errback)
         * then(callback, errback, scope)
         * 
         */     
		this.then = function then() {
	       if (arguments[0] instanceof Function) {
               if (arguments[1] instanceof Function) {
            	   _stateMachine.event("addSuccess", arguments[0]);
               } else {
            	   _stateMachine.event("addSuccess", arguments[0], arguments[1]);
               }
           }
           
           if (arguments[1] instanceof Function) {
        	   _stateMachine.event("addFail", arguments[1], arguments[2]);
           } 
           
           if (arguments[2] instanceof Function) {
        	   _stateMachine.event("addFail", arguments[2], arguments[3]);
           }
           return this;
		};
		
		/**
		 * Get the promise's observable
		 * for debugging only
		 * @private
		 * @returns {Observable}
		 */
		this.getObservable = function getObservable() {
			return _observable;
		};
		
		/**
		 * Get the promise's stateMachine
		 * for debugging only
		 * @private
		 * @returns {StateMachine}
		 */
		this.getStateMachine = function getStateMachine() {
			return _stateMachine;
		};
		
	};
	
});/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("StateMachine", 
		
["Tools"],
/**
 * @class
 * Create a stateMachine
 */
function StateMachine(Tools) {
	
	 /**
     * @param initState {String} the initial state
     * @param diagram {Object} the diagram that describes the state machine
     * @example
     *
     *      diagram = {
     *              "State1" : [
     *                      [ message1, action, nextState], // Same as the state's add function
     *                      [ message2, action2, nextState]
     *              ],
     *
     *              "State2" :
     *                       [ message3, action3, scope3, nextState]
     *                      ... and so on ....
     *
     *   }
     *
     * @return the stateMachine object
     */
	function StateMachineConstructor($initState, $diagram) {

		/**
		 * The list of states
		 * @private
		 */
		var _states = {},
		
		/**
		 * The current state
		 * @private
		 */
		_currentState = "";
		
		/**
		 * Set the initialization state
		 * @param {String} name the name of the init state
		 * @returns {Boolean}
		 */
		this.init = function init(name) {
				if (_states[name]) {
					_currentState = name;
					return true;
				} else {
					return false;
				}
		};
		
		/**
		 * Add a new state
		 * @private
		 * @param {String} name the name of the state
		 * @returns {State} a new state
		 */
		this.add = function add(name) {
			if (!_states[name]) {
				return _states[name] = new Transition();
			} else {
				return false;
			}

		};
		
		/**
		 * Get an existing state
		 * @private
		 * @param {String} name the name of the state
		 * @returns {State} the state
		 */
		this.get = function get(name) {
			return _states[name];
		};
		
		/**
		 * Get the current state
		 * @returns {String}
		 */
		this.getCurrent = function getCurrent() {
			return _currentState;
		};
		
		/**
		 * Pass an event to the state machine
		 * @param {String} name the name of the event
		 * @returns {Boolean} true if the event exists in the current state
		 */
		this.event = function event(name) {
			var nextState;
			
			nextState = _states[_currentState].event.apply(_states[_currentState].event, Tools.toArray(arguments));
			// False means that there's no such event
			// But undefined means that the state doesn't change
			if (nextState === false) {
				return false;
			} else {
				// There could be no next state, so the current one remains
				if (nextState) {
					// Call the exit action if any
					_states[_currentState].event("exit");
					_currentState = nextState;
					// Call the new state's entry action if any
					_states[_currentState].event("entry");
				} 
				return true;
			}
		};
		
		/**
		 * Initializes the StateMachine with the given diagram
		 */
		Tools.loop($diagram, function (transition, state) {
			var myState = this.add(state);
			transition.forEach(function (params){
				myState.add.apply(null, params);
			});
		}, this);
		
		/**
		 * Sets its initial state
		 */
		this.init($initState);
	}

	/**
	 * Each state has associated transitions
     * @constructor
	 */
	function Transition() {

		/**
		 * The list of transitions associated to a state
		 * @private
		 */
		var _transitions = {};
		
		/**
		 * Add a new transition
		 * @private
		 * @param {String} event the event that will trigger the transition
		 * @param {Function} action the function that is executed
		 * @param {Object} scope [optional] the scope in which to execute the action
		 * @param {String} next [optional] the name of the state to transit to.
		 * @returns {Boolean} true if success, false if the transition already exists
		 */
		this.add = function add(event, action, scope, next) {
			
			var arr = [];
		
			if (_transitions[event]) {
				return false;
			}
			
			if (typeof event == "string"
				&& typeof action == "function") {	
					
					arr[0] = action;
				
					if (typeof scope == "object") {
						arr[1] = scope;
					} 
					
					if (typeof scope == "string") {
						arr[2] = scope;
					} 
					
					if (typeof next == "string") {
						arr[2] = next;
					}
				
					_transitions[event] = arr;
					return true;
			} 
				
			return false;	
		};
		
		/**
		 * Check if a transition can be triggered with given event
		 * @private
		 * @param {String} event the name of the event
		 * @returns {Boolean} true if exists
		 */
		this.has = function has(event) {
			return !!_transitions[event];
		};
		
		/**
		 * Get a transition from it's event
		 * @private
		 * @param {String} event the name of the event
		 * @return the transition
		 */
		this.get = function get(event) {
			return _transitions[event] || false;
		};
		
		/**
		 * Execute the action associated to the given event
		 * @param {String} event the name of the event
		 * @param {params} params to pass to the action
		 * @private
		 * @returns false if error, the next state or undefined if success (that sounds weird)
		 */
		this.event = function event(event) {
			var _transition = _transitions[event];
			if (_transition) {
				_transition[0].apply(_transition[1], Tools.toArray(arguments).slice(1));
				return _transition[2];
			} else {
				return false;
			}
		};
	};
	
	return StateMachineConstructor;
	
});
/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Store", ["Observable", "Tools"],
/** 
 * @class
 * Store creates a small NoSQL database with observables
 * It can publish events on store/data changes
 */
 function Store(Observable, Tools) {
	
	/**
	 * Defines the Store
	 * @private
	 * @param values
	 * @returns
	 */
	return function StoreConstructor($data) {
		
		/**
		 * Where the data is stored
		 * @private
		 */
		var _data = Tools.clone($data) || {},
		
		/**
		 * The observable
		 * @private
		 */
		_storeObservable = new Observable(),
		
		_valueObservable = new Observable(),
		
		/**
		 * Gets the difference between two objects and notifies them
		 * @private
		 * @param previousData
		 * @returns
		 */
		_notifyDiffs = function _notifyDiffs(previousData) {
			var diffs = Tools.objectsDiffs(previousData, _data);
			["updated",
			 "deleted",
			 "added"].forEach(function (value) {
				 diffs[value].forEach(function (dataIndex) {
						_storeObservable.notify(value, dataIndex, _data[dataIndex]);
						_valueObservable.notify(dataIndex, _data[dataIndex], value);
				 });
			});
		};
		
		/**
		 * Get the number of items in the store
		 * @returns {Number} the number of items in the store
		 */
		this.getNbItems = function() {
			return _data instanceof Array ? _data.length : Tools.count(_data);
		};
		
		/**
		 * Get a value from its index
		 * @param {String} name the name of the index
		 * @returns the value
		 */
		this.get = function get(name) {
			return _data[name];
		};
		
		/**
		 * Checks if the store has a given value
		 * @param {String} name the name of the index
		 * @returns {Boolean} true if the value exists
		 */
		this.has = function has(name) {
			return _data.hasOwnProperty(name);
		};
		
		/**
		 * Set a new value and overrides an existing one
		 * @param {String} name the name of the index
		 * @param value the value to assign
		 * @returns true if value is set
		 */
		this.set = function set(name, value) {
			var ante,
				action;
			
			if (typeof name != "undefined") {
				ante = this.has(name);
				_data[name] = value;
				action = ante ? "updated" : "added";
				_storeObservable.notify(action, name, _data[name]);	
				_valueObservable.notify(name, _data[name], action);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Update the property of an item.
		 * @param {String} name the name of the index
		 * @param {String} property the property to modify.
		 * @param value the value to assign
		 * @returns false if the Store has no name index
		 */
		this.update = function update(name, property, value) {
			var item;
			if (this.has(name)) {
				item = this.get(name);
				Tools.setNestedProperty(item, property, value);
				_storeObservable.notify("updated", property, value);
				_valueObservable.notify(name, item, "updated");
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Delete value from its index
		 * @param {String} name the name of the index from which to delete the value
		 * @returns true if successfully deleted.
		 */
		this.del = function del(name) {
			if (this.has(name)) {
				if (!this.alter("splice", name, 1)) {
					delete _data[name];
					_storeObservable.notify("deleted", name);
					_valueObservable.notify(name, _data[name], "deleted");
				}
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Delete multiple indexes. Prefer this one over multiple del calls.
		 * @param {Array} 
		 * @returns false if param is not an array.
		 */
		this.delAll = function delAll(indexes) {
			if (indexes instanceof Array) {
				// Indexes must be removed from the greatest to the lowest
				// To avoid trying to remove indexes that don't exist.
				// i.e: given [0, 1, 2], remove 1, then 2, 2 doesn't exist anymore
				indexes.sort(Tools.compareNumbers).reverse().forEach(this.del, this);
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Alter the data be calling one of it's method
		 * When the modifications are done, it notifies on changes.
		 * @param {String} func the name of the method
		 * @returns the result of the method call
		 */
		this.alter = function alter(func) {
			var apply,
				previousData;
			
			if (_data[func]) {
				previousData = Tools.clone(_data);
				apply = _data[func].apply(_data, Array.prototype.slice.call(arguments, 1));
				_notifyDiffs(previousData);
				return apply;
			} else {
				return false;
			}
		};
		
		/**
		 * Watch the store's modifications
		 * @param {String} added/updated/deleted
		 * @param {Function} func the function to execute
		 * @param {Object} scope the scope in which to execute the function
		 * @returns {Handler} the subscribe's handler to use to stop watching
		 */
		this.watch = function watch(name, func, scope) {
			return _storeObservable.watch(name, func, scope);
		};
		
		/**
		 * Unwatch the store modifications
		 * @param {Handler} handler the handler returned by the watch function
		 * @returns
		 */
		this.unwatch = function unwatch(handler) {
			return _storeObservable.unwatch(handler);
		};
		
		/**
		 * Get the observable used for watching store's modifications
		 * Should be used only for debugging
		 * @returns {Observable} the Observable
		 */
		this.getStoreObservable = function getStoreObservable() {
			return _storeObservable;
		};
		
		/**
		 * Watch a value's modifications
		 * @param {String} name the name of the value to watch for
		 * @param {Function} func the function to execute
		 * @param {Object} scope the scope in which to execute the function
		 * @returns true if unwatched
		 */
		this.watchValue = function watchValue(name, func, scope) {
			return _valueObservable.watch(name, func, scope);
		};
		
		/**
		 * Unwatch the value's modifications
		 * @param {Handler} handler the handler returned by the watchValue function
		 * @private
		 * @returns true if unwatched
		 */
		this.unwatchValue = function unwatchValue(handler) {
			return _valueObservable.unwatch(handler);
		};
		
		/**
		 * Get the observable used for watching value's modifications
		 * Should be used only for debugging
		 * @private
		 * @returns {Observable} the Observable
		 */
		this.getValueObservable = function getValueObservable() {
			return _valueObservable;
		};

		/**
		 * Loop through the data
		 * @param {Function} func the function to execute on each data
		 * @param {Object} scope the scope in wich to run the callback
		 */
		this.loop = function loop(func, scope) {
			Tools.loop(_data, func, scope);
		};
		
		/**
		 * Reset all data and get notifications on changes
		 * @param {Arra/Object} data the new data
		 * @returns {Boolean}
		 */
		this.reset = function reset(data) {
			if (data instanceof Object) {
				var previousData = Tools.clone(_data);
				_data = Tools.clone(data) || {};
				_notifyDiffs(previousData);
				return true;
			} else {
				return false;
			}

		};
		
		/**
		 * Dumps a JSON version of all the data
		 * @returns {JSON}
		 */
		this.toJSON = function toJSON() {
			return JSON.stringify(_data);
		};
	};
});/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Tools",
/**
 * @class
 * Tools is a collection of tools 
 */
function Tools(){

	return {
	    /**
	     * For applications that don't run in a browser, window is not the global object.
	     * This function returns the global object wherever the application runs.
	     * @returns {Object} the global object
	     */
		getGlobal: function getGlobal() {
	    	var func = function() {
	    		return this;
	    	};
	    	return func.call(null);
	    },
		
		/**
		 * Mixes an object into another
		 * @param {Object} destination object to mix values into
		 * @param {Object} source object to get values from
		 * @param {Boolean} optional, set to true to prevent overriding
		 */
	    mixin: function mixin(source, destination, dontOverride) {
			this.loop(source, function (value, idx) {
				if (!destination[idx] || !dontOverride) {
					destination[idx] = source[idx];	
				}
			});
			return destination;
		},
		
		/**
		 * Count the number of properties in an object
		 * It doesn't look up in the prototype chain
		 * @param {Object} object the object to count
		 * @returns {Number}
		 */
		count: function count(object) {
			var nbItems = 0;
			this.loop(object, function () {
				nbItems++;
			});
			
			return nbItems;
		},
		
		/**
		 * Compares the properties of two objects and returns true if they're the same
		 * It's doesn't do it recursively
		 * @param {Object} first object
		 * @param {Object} second object
		 * @returns {Boolean} true if the two objets have the same properties
		 */
		compareObjects: function compareObjects(object1, object2) {
			var getOwnProperties = function (object) {
				return Object.getOwnPropertyNames(object).sort().join("");
			};
			return getOwnProperties(object1) == getOwnProperties(object2);
		},
		
		/**
		 * Compares two numbers and tells if the first one is bigger (1), smaller (-1) or equal (0)
		 * @param {Number} number1 the first number
		 * @param {Number} number2 the second number
		 * @returns 1 if number1>number2, -1 if number2>number1, 0 if equal
		 */
		compareNumbers: function compareNumbers(number1, number2) {
			  if (number1>number2) {
			    return 1;  
			  } else if (number1<number2) {
			    return -1;				  
			  } else {
				 return 0;
			  }
		},
		
		/**
		 * Transform array-like objects to array, such as nodeLists or arguments
		 * @param {Array-like object}
		 * @returns {Array}
		 */
		toArray: function toArray(array) {
			return Array.prototype.slice.call(array);
		},
		
		/**
		 * Small adapter for looping over objects and arrays
		 * Warning: it's not meant to be used with nodeList
		 * @param {Array/Object} iterated the array or object to loop through
		 * @param {Function} callback the function to execute for each iteration
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns {Boolean} true if executed
		 */
		loop: function loop(iterated, callback, scope) {
			var i, 
				length;
			
			if (iterated instanceof Object && typeof callback == "function") {
				length = iterated.length;
				if (length) {
					for (i=0; i<length; i++) {
						callback.call(scope, iterated[i], i, iterated);
					}
				} else {
					for (i in iterated) {
						if (iterated.hasOwnProperty(i)) {
							callback.call(scope, iterated[i], i, iterated);
						}
					}
				}
				return true;
			} else {
				return false;
			}
		},
		
		/**
		 * Make a diff between two objects
		 * @param {Array/Object} before is the object as it was before
		 * @param {Array/Object} after is what it is now
		 * @example: 
		 * 	With objects:
		 * 
		 * 	before = {a:1, b:2, c:3, d:4, f:6}
		 * 	after = {a:1, b:20, d: 4, e: 5}
		 * 	will return : 
		 * 	{
		 *  	unchanged: ["a", "d"],
		 *  	updated: ["b"],
		 *  	deleted: ["f"],
		 *  	added: ["e"]
		 * 	}
		 * 
		 * It also works with Arrays:
		 * 
		 * 	before = [10, 20, 30]
		 * 	after = [15, 20]
		 * 	will return : 
		 * 	{
		 *  	unchanged: [1],
		 *  	updated: [0],
		 *  	deleted: [2],
		 *  	added: []
		 * 	}
		 * 
		 * @returns object
		 */
		objectsDiffs : function objectsDiffs(before, after) {
			if (before instanceof Object && after instanceof Object) {
				var unchanged = [],
					updated = [],
					deleted = [],
					added = [];

				 // Look through the after object
				 this.loop(after, function (value, idx) {

					 // To get the added
					 if (typeof before[idx] == "undefined") {
						 added.push(idx);

					 // The updated
					 } else if (value !== before[idx]) {
						 updated.push(idx);

					 // And the unchanged
					 } else if (value === before[idx]) {
						 unchanged.push(idx);
					 }

				 });

				 // Loop through the before object
				 this.loop(before, function (value, idx) {

					// To get the deleted 
					if (typeof after[idx] == "undefined") {
						deleted.push(idx);
					} 
				 });

				return {
					updated: updated,
					unchanged: unchanged,
					added: added,
					deleted: deleted
				};

			} else {
				return false;
			}
		},
		
		/**
		 * Transforms Arrays and Objects into valid JSON
		 * @param {Object/Array} object the object to JSONify 
		 * @returns the JSONified object or false if failed
		 */
		jsonify: function jsonify(object) {
			if (object instanceof Object) {
				return JSON.parse(JSON.stringify(object));	
			} else {
				return false;
			}
		},
		
		/**
		 * Clone an Array or an Object
		 * @param {Array/Object} object the object to clone
		 * @returns {Array/Object} the cloned object
		 */
		clone: function clone(object) {
			if (object instanceof Array) {
				return object.slice(0);
			} else if (typeof object == "object" && object !== null && !(object instanceof RegExp)) {
				return this.mixin(object, {});
			} else {
				return false;
			}
		},
		
		
		/**
		 * 
		 * 
		 * 
		 * 
		 * Refactoring needed for the following 
		 * 
		 * 
		 * 
		 * 
		 * 
		 */
		
		/**
		 * Get the property of an object nested in one or more objects
		 * given an object such as a.b.c.d = 5, getNestedProperty(a, "b.c.d") will return 5.
		 * @param {Object} object the object to get the property from
		 * @param {String} property the path to the property as a string
		 * @returns the object or the the property value if found
		 */
		getNestedProperty: function getNestedProperty(object, property) {
			if (object && object instanceof Object) {
				if (typeof property == "string" && property != "") {
					var split = property.split(".");
					return split.reduce(function (obj, prop) {
						return obj && obj[prop];
					}, object);
				} else if (typeof property == "number") {
					return object[property];
				} else {
					return object;
				}
			} else {
				return object;
			}
		},
		
		/**
		 * Set the property of an object nested in one or more objects
		 * If the property doesn't exist, it gets created.
		 * @param {Object} object
		 * @param {String} property
		 * @param value the value to set
		 * @returns object if no assignment was made or the value if the assignment was made
		 */
		setNestedProperty: function setNestedProperty(object, property, value) {
			if (object && object instanceof Object) {
				if (typeof property == "string" && property != "") {
					var split = property.split(".");
					return split.reduce(function (obj, prop, idx) {
						obj[prop] = obj[prop] || {};
						if (split.length == (idx + 1)) {
							obj[prop] = value;
						}
						return obj[prop];
					}, object);
				} else if (typeof property == "number") {
					object[property] = value;
					return object[property];
				} else {
					return object;
				}
			} else {
				return object;
			}
		}
		
		
		
	};
	
	
});
		/**
 * Emily
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define("Transport", 
		
["Store", "Tools"],
/**
 * @class
 * Transport creates the link between your requests and Emily's requests handlers.
 * A request handler can be defined to make requets of any kind as long as it's supported
 * by your node.js. (HTTP, FileSystem, SIP...)
 */
function Transport(Store, Tools) {
	
	/**
	 * Create a Transport
	 * @param {Object} $reqHandlers the requestHandler defined in your node.js app
	 * @returns
	 */
	return function TransportConstructor($reqHandlers) {
		
		/**
		 * The request handlers
		 * @private
		 */
		var _reqHandlers = null;
		
		/**
		 * Set the requests handlers
		 * @param {Object} reqHandlers the list of requests handlers
		 * @returns
		 */
		this.setReqHandlers = function setReqHandlers(reqHandlers) {
			if (reqHandlers instanceof Store) {
				_reqHandlers = reqHandlers;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get the requests handlers
		 * @private
		 * @returns
		 */
		this.getReqHandlers = function getReqHandlers() {
			return _reqHandlers;
		};
		
		/**
		 * Make a request
		 * @param {String} channel is the name of the request handler to use
		 * @param {Object} reqData the request data
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.request = function request(channel, reqData, callback, scope) {
			if (_reqHandlers.has(channel) && typeof reqData == "object") {
				_reqHandlers.get(channel)(reqData, function () {
					callback && callback.apply(scope, arguments);
				});
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Listen to a path (Kept alive)
		 * @param {String} channel is the name of the request handler to use
		 * @param {Object} reqData the request data: path should indicate the url, query can add up query strings to the url
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.listen = function listen(channel, reqData, callback, scope) {
			if (_reqHandlers.has(channel) && typeof reqData == "object" && 
				typeof reqData.path == "string" && typeof callback == "function") {
				var func = function () {
					callback.apply(scope, arguments);
				},
				abort;
				
				Tools.mixin({
					keptAlive: true,
					method: "get"
				}, reqData);
				
				abort = _reqHandlers.get(channel)(reqData, func, func);
				return function () {
					abort.func.call(abort.scope);
				};
			} else {
				return false;
			}
		};
		
		this.setReqHandlers($reqHandlers);
		
	};
	
});