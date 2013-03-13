/**
 * Emily
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */

define(["Tools"],
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
		 * @returns handle
		 */
		this.watch = function watch(topic, callback, scope) {
			if (typeof callback == "function") {
				var observers = _topics[topic] = _topics[topic] || [],
				observer = [callback, scope];

				observers.push(observer);
				return [topic,observers.indexOf(observer)];

			} else {
				return false;
			}
		};

		/**
		 * Remove an observer
		 * @param {Handle} handle returned by the watch method
		 * @returns {Boolean} true if there were subscribers
		 */
		this.unwatch = function unwatch(handle) {
			var topic = handle[0], idx = handle[1];
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
				args = Tools.toArray(arguments).slice(1);

			if (observers) {
				Tools.loop(observers, function (value) {
					try {
						value && value[0].apply(value[1] || null, args);
					} catch (err) { }
				});
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Check if topic has the described observer
		 * @param {Handle}
		 * @returns {Boolean} true if exists
		 */
		this.hasObserver = function hasObserver(handle) {
			return !!( handle && _topics[handle[0]] && _topics[handle[0]][handle[1]]);
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

});
