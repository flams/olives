/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

define("Olives/Transport",
		
["Observable"],
/** 
 * @class
 * Transport allows for client-server eventing.
 * It's based on socket.io.
 */
function Transport(Observable) {

	/**
	 * Defines the Transport
	 * @private
	 * @param {url} $url the url to connect Transport to
	 * @returns
	 */
	return function TransportConstructor($url) {
		
		/**
		 * @private
		 * The socket.io's socket
		 */
		var _socket = null,
		
		/**
		 * @private
		 * The socket.io globally defined module
		 */
		_io = io,
		
		/**
		 * @private
		 * The Observable that is used for the listen function
		 */
		_observable = new Observable();
		
		/**
		 * Connect Transport to an url
		 * @param {Url} url the url to connect Transport to
		 */
		this.connect = function connect(url) {
			_socket = _io.connect(url);
			return !!_socket;
		},
		
		/**
		 * Get the socket, for debugging purpose
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
				
			_socket[requestData.keptAlive ? "on" : "once"](eventId, boundCallback);
			requestData.__eventId__ = eventId;
			_socket.emit(channel, requestData);
			if (requestData.keptAlive) {
				return function stop() {
						_socket.removeListener(eventId, boundCallback);
				};
			}
		};
		
		/**
		 * Listen to an url and get notified on new data
		 * @param {String} channel watch the server's documentation to see available channels
		 * @param {String} path the url on which to get new data
		 * @param {Function} func the callback that will get the data
		 * @param {Object} scope the scope in which to execute the callback
		 * @returns
		 */
		this.listen = function listen(channel, path, func, scope) {
			
			var topic = channel + "/" + path,
				handler,
				stop;
			
			// If no such topic
			if (!_observable.hasTopic(topic)) {
				// Listen to changes on this topic (an url actually)
				stop = this.request(channel, {
					path: path,
					method: "GET",
					keptAlive: true
				// Notify when new data arrives
				}, function (data) {
					_observable.notify(topic, data);
				}, this);
			}
			
			// Add the observer
			handler = _observable.watch(topic, func, scope);

			return {
				// If the observer is not interested anymore, unwatch
				stop: function () {
					_observable.unwatch(handler);
					// If no more observers
					if (!_observable.hasTopic(topic)) {
						// stop listening
						stop();
					}
				}
			};
		};
		
		/**
		 * This function is for debugging only
		 * @returns {Observable}
		 */
		this.getListenObservable = function getListenObservable() {
			return _observable;
		};
		
		/**
		 * Initializes the transport to the given url.
		 */
		this.connect($url);
	};
});