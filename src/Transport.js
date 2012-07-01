/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

define("Olives/Transport",
		
["Observable", "Tools"],
/** 
 * @class
 * Transport allows for client-server eventing.
 * It's based on socket.io.
 */
function Transport(Observable, Tools) {

	/**
	 * Defines the Transport
	 * @private
	 * @param {Object} $io socket.io's object
	 * @param {url} $url the url to connect Transport to
	 * @returns
	 */
	return function TransportConstructor($io, $url) {
		
		/**
		 * @private
		 * The socket.io's socket
		 */
		var _socket = null,
		
		/**
		 * @private
		 * The socket.io globally defined module
		 */
		_io = null,
		
		/**
		 * @private
		 * The Observable that is used for the listen function
		 */
		_observable = new Observable(),
		
		/**
		 * @private
		 * listen internally calls request, which returns a "stop listen" function
		 * It should be saved in an object alongside the topic name
		 */
		_stops = {};
		
		/**
		 * Set the io handler (socket.io)
		 * @param {Object} io the socket.io object
		 * @returns true if it seems to be socket.io
		 */
		this.setIO = function setIO(io) {
			if (io && typeof io.connect == "function") {
				_io = io;
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get socket.io, for debugging purpose
		 * @private
		 * @param 
		 * @returns the handler
		 */
		this.getIO = function getIO() {
			return _io;
		};
		
		/**
		 * Connect Transport to an url
		 * @param {Url} url the url to connect Transport to
		 */
		this.connect = function connect(url) {
			if (typeof url == "string") {
				_socket = _io.connect(url);
				return true;	
			} else {
				return false;
			}
		},
		
		/**
		 * Get the socket, for debugging purpose
		 * @private
		 * @returns {Object} the socket
		 */
		this.getSocket = function getSocket() {
			return _socket;
		},
		
		/**
		 * Subscribe to a socket event
		 * @param {String} event the name of the event
		 * @param {Function} func the function to execute when the event fires
		 */
		this.on = function on(event, func) {
			_socket.on(event, func);
		},
		
		/**
		 * Subscribe to a socket event but disconnect as soon as it fires.
		 * @param {String} event the name of the event
		 * @param {Function} func the function to execute when the event fires
		 */
		this.once = function once(event, func) {
			_socket.once(event, func);
		};
		
		/**
		 * Publish an event on the socket
		 * @param {String} event the event to publish
		 * @param data
		 * @param {Function} callback is the function to be called for ack
		 */
		this.emit = function emit(event, data, callback) {
			_socket.emit(event, data, callback);
		};
		
		/**
		 * Make a request on the node server
		 * @param {String} channel watch the server's documentation to see available channels
		 * @param {Object} requestData the JSON that details the request
		 * @param {Function} func the callback that will get the response.
		 * @param {Object} scope the scope in which to execute the callback
		 */
		this.request = function request(channel, requestData, func, scope) {
			var eventId = Date.now() + Math.floor(Math.random()*1e6),
				boundCallback = function () {
					func && func.apply(scope || null, arguments);
				};
				
			_socket[requestData.__keepalive__ ? "on" : "once"](eventId, boundCallback);
			requestData.__eventId__ = eventId;
			_socket.emit(channel, requestData);
			if (requestData.__keepalive__) {
				return function stop() {
					_socket.emit("disconnect-" + eventId);
					_socket.removeListener(eventId, boundCallback);
				};
			}
		};
		
		/**
		 * Listen to an url and get notified on new data
		 * @param {String} channel watch the server's documentation to see available channels
		 * @param {Object} reqData the request data: path should indicate the url, query can add up query strings to the url
		 * @param {Function} func the callback that will get the data
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.listen = function listen(channel, reqData, func, scope) {
			
			var topic = channel + "/" + reqData.path,
				handler;
			
			// If listen to this topic for the first time
			if (!_observable.hasTopic(topic)) {
				// Add params to the request
				Tools.mixin({
					method: "GET",
					__keepalive__: true
				}, reqData);
				
				// Listen to changes on this topic (an url actually)
				_stops[topic] = this.request(channel, reqData, 
						// Notify when new data arrives
						function (data) {
					_observable.notify(topic, data);
				}, this);
			}
			
			// Add the observer
			handler = _observable.watch(topic, func, scope);

			return function () {
					_observable.unwatch(handler);
					// If no more observers
					if (!_observable.hasTopic(topic)) {
						// stop listening
						_stops[topic]();
					}
			};
		};
		
		/**
		 * This function is for debugging only
		 * @private
		 */
		this.getStopFunctions = function getStopFunctions() {
			return _stops;
		};
		
		/**
		 * This function is for debugging only
		 * @private
		 * @returns {Observable}
		 */
		this.getListenObservable = function getListenObservable() {
			return _observable;
		};
		
		/**
		 * Initializes the transport to the given url.
		 */
		this.setIO($io);
		this.connect($url);
	};
});
