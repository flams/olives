/**
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
		 * The database name
		 * @private
		 */
		_database = null,
		
		/**
		 * The name of the view
		 * @private
		 */
		_view = null,
		
		/**
		 * The name of the document
		 * @private
		 */
		_document = null,
		
		/**
		 * The name of the design document
		 * @private
		 */
		_design = null,
		
		/**
		 * An object to store info like update_sq
		 * @private
		 */
		_dbInfo = {},
		
		/**
		 * The promise that is returned by sync
		 * It's resolved when entering listening state
		 * It's rejected when no such document to sync to
		 * @private
		 */
		_syncPromise = new Promise(),
		
		/**
		 * The state machine
		 * @private
		 * it concentrates almost the whole logic.
		 * It can already be extended to handle reconnect for instance
		 */
		_stateMachine = new StateMachine("Unsynched", {
			"Unsynched": [
			              
			 ["getView", function () {
					_transport.request(_channel, {
						method: "GET",
						path: "/" + _database + "/_design/" + _design + "/" + "_view/" + _view +"?update_seq=true"
					}, function (results) {
						var json = JSON.parse(results);
						_dbInfo = {
								total_rows: json.total_rows,
								update_seq: json.update_seq,
								offset: json.offset
						};
						
						this.reset(json.rows);
						_stateMachine.event("subscribeToViewChanges", json.update_seq);
					}, this);
				}, this, "Synched"],
				
				["getDocument", function () { 
					_transport.request(_channel, {
						method: "GET",
						path: "/" + _database + "/" + _document
					}, function (results) {
						var json = JSON.parse(results);
						if (json._id) {
							this.reset(json);
							_stateMachine.event("subscribeToDocumentChanges");	
						} else {
							_syncPromise.reject(this);
						}
					}, this);
				}, this, "Synched"]],
						
			"Synched": [
			            
	            ["updateDatabase", function () {
	            	_transport.request(_channel, {
	            		method: "PUT",
	            		path: '/' + _database + '/' + _document,
	            		headers: {
	            			"Content-Type": "application/json"
	            		},
	            		data: this.toJSON()
	            	}, function () {
	            		_stateMachine.event("subscribeToDocumentChanges");
	            	});
	            }, this],
			           
			  ["subscribeToViewChanges", function (update_seq) {
					_transport.listen(_channel
					, "/" + _database + "/_changes?feed=continuous&heartbeat=20000&since="+update_seq
					, function (changes) {
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
				}, this, "Listening"],
				
				["subscribeToDocumentChanges", function () {
					_transport.listen(_channel
					, "/" + _database + "/_changes?feed=continuous&heartbeat=20000"
					, function (changes) {
						var json;
						// Should I test for this very special case (heartbeat?)
						// Or do I have to try catch for any invalid json?
						if (changes == "\n") {
							return false;
						}
						
						json = JSON.parse(changes);
						
						// The document is the modified document is the current one
						if (json.id == _document && 
							// And if it has a new revision
							json.changes.pop().rev != this.get("_rev")) {
							
							if (json.deleted) {
								_stateMachine.event("deleteDoc");
							} else {
								_stateMachine.event("updateDoc");	
							}
						 }
					}, this);
				}, this, "Listening"]],
				
			"Listening": [
			              
	              ["entry", function () {
	            	  _syncPromise.resolve(this);
	              }, this],
			              
			    ["change", function (id) {
					_transport.request(_channel,{
						method: "GET",
						path: '/'+_database+'/_design/'+_design+'/_view/'+_view
					}, function (view) {
						var json = JSON.parse(view);
						
						json.rows.some(function (value, idx) {
							if (value.id == id) {
								this.set(idx, value);
							}
						}, this);

						
					}, this);
					
				}, this],
				
				["delete", function (id) {
					this.loop(function (value, idx) {
						if (value.id == id) {
							this.del(idx);
						}
					}, this);
				}, this],
				
				["add", function (id) {
					_transport.request(_channel,{
						method: "GET",
						path: '/'+_database+'/_design/'+_design+'/_view/'+_view
					}, function (view) {
						var json = JSON.parse(view);
						
						json.rows.some(function (value, idx) {
							if (value.id == id) {
								this.alter("splice", idx, 0, value);	
							}
						}, this);
						
					}, this);
				}, this],
				
				["updateDoc", function () {
					_transport.request(_channel,{
						method: "GET",
						path: '/'+_database+'/' + _document
					}, function (doc) {
						this.reset(JSON.parse(doc));			
					}, this);
			    }, this],
			    
			    ["deleteDoc", function () {
			    	this.reset({});			
			    }, this],
			    
			    ["updateDatabase", function () {
			    	_transport.request(_channel, {
	            		method: "PUT",
	            		path: '/' + _database + '/' + _document,
	            		headers: {
	            			"Content-Type": "application/json"
	            		},
	            		data: this.toJSON()
	            	});
			    }, this],
			    
			    ["removeFromDatabase", function () {
			    	_transport.request(_channel, {
	            		method: "DELETE",
	            		path: '/' + _database + '/' + _document + '?rev=' + this.get("_rev")
	            	});
			    }, this]
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
				_database = arguments[0];
				_design = arguments[1];
				_view = arguments[2];
				_stateMachine.event("getView");
				return _syncPromise;
			} else if (typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "undefined") {
				_database = arguments[0];
				_document = arguments[1];
				_stateMachine.event("getDocument");
				return _syncPromise;
			}
			return false;
		};
		
		/**
		 * Update the database with the current document
		 * @returns true if update called
		 */
		this.update = function update() {
			return _stateMachine.event("updateDatabase");
		};
		
		/**
		 * Remove the document from the database
		 * @returns true if remove called
		 */
		this.remove = function remove() {
			return _stateMachine.event("removeFromDatabase");
		};
		
		/**
		 * Get a specific info about the current view
		 * Should be used only for debugging
		 * @param {String} name (update_seq/offset/total_rows)
		 * Note: if you want to get the number of items, store.getNbItems() is the func for that
		 * @returns the info
		 */
		this.getDBInfo = function getDBInfo(name) {
			return _dbInfo[name];
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
		 * @returns {StateMachine} the state machine
		 */
		this.getStateMachine = function getStateMachine() {
			return _stateMachine;
		};
		
		/**
		 * Get the current transport
		 * Also only useful for debugging
		 * @returns {Object} the current transport
		 */
		this.getTransport = function getTransport() {
			return _transport;
		};

	};
	
	return function CouchDBStoreFactory() {
		CouchDBStoreConstructor.prototype = new Store;
		return new CouchDBStoreConstructor;
	};
	
});