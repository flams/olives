/**
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
	
});