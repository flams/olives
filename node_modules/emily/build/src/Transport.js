/**
 * Emily
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

/**
 * @class
 * Transport hides and centralizes the logic behind requests.
 * It can issue requests to request handlers, which in turn can issue requests
 * to anything your node.js server has access to (HTTP, FileSystem, SIP...)
 */


	/**
	 * Create a Transport
	 * @param {Emily Store} [optionanl] $reqHandlers an object containing the request handlers
	 * @returns
	 */
	module.exports =  function TransportConstructor($reqHandlers) {

		/**
		 * The request handlers
		 * @private
		 */
		var _reqHandlers = null;

		/**
		 * Set the requests handlers object
		 * @param {Emily Store} reqHandlers an object containing the requests handlers
		 * @returns
		 */
		this.setReqHandlers = function setReqHandlers(reqHandlers) {
			if (reqHandlers instanceof Object) {
				_reqHandlers = reqHandlers;
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Get the requests handlers
		 * @returns{ Emily Store} reqHandlers the object containing the requests handlers
		 */
		this.getReqHandlers = function getReqHandlers() {
			return _reqHandlers;
		};

		/**
		 * Issue a request to a request handler
		 * @param {String} reqHandler the name of the request handler to issue the request to
		 * @param {Object} data the data, or payload, to send to the request handler
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.request = function request(reqHandler, data, callback, scope) {
			if (_reqHandlers.has(reqHandler) &&
				typeof data != "undefined") {

				_reqHandlers.get(reqHandler)(data, function () {
					if (callback) {
						callback.apply(scope, arguments);
					}
				});
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Issue a request to a reqHandler but keep listening for the response as it can be sent in several chunks
		 * or remain open as long as the abort funciton is not called
		 * @param {String} reqHandler the name of the request handler to issue the request to
		 * @param {Object} data the data, or payload, to send to the request handler
		 * @param {Function} callback the function to execute with the result
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns {Function} the abort function to call to stop listening
		 */
		this.listen = function listen(reqHandler, data, callback, scope) {
			if (_reqHandlers.has(reqHandler) &&
				typeof data != "undefined" &&
				typeof callback == "function") {

				var func = function () {
					callback.apply(scope, arguments);
				},
				abort;

				abort = _reqHandlers.get(reqHandler)(data, func, func);
				return function () {
					if (typeof abort == "function") {
						abort();
					} else if (typeof abort == "object" && typeof abort.func == "function") {
						abort.func.call(abort.scope);
					}
				};
			} else {
				return false;
			}
		};

		this.setReqHandlers($reqHandlers);

	};
