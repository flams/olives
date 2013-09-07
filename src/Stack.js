/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

define(

/**
 * @class
 * A Stack is a tool for managing DOM elements as groups. Within a group, dom elements
 * can be added, removed, moved around. The group can be moved to another parent node
 * while keeping the DOM elements in the same order, excluding the parent dom elements's
 * children that are not in the Stack.
 */
function Stack() {

	"use strict";

	var Tools = require("Tools");

	return function StackConstructor($parent) {

		/**
		 * The parent DOM element is a documentFragment by default
		 * @private
		 */
		var _parent = document.createDocumentFragment(),

		/**
		 * The place where the dom elements hide
		 * @private
		 */
		_hidePlace = document.createElement("div"),

		/**
		 * The list of dom elements that are part of the stack
		 * Helps for excluding elements that are not part of it
		 * @private
		 */
		_childNodes = [],

		_lastTransit = null;

		/**
		 * Add a DOM element to the stack. It will be appended.
		 * @param {HTMLElement} dom the DOM element to add
		 * @returns {HTMLElement} dom
		 */
		this.add = function add(dom) {
			if (!this.has(dom) && dom instanceof HTMLElement) {
				_parent.appendChild(dom);
				_childNodes.push(dom);
				return dom;
			} else {
				return false;
			}
		};

		/**
		 * Remove a DOM element from the stack.
		 * @param {HTMLElement} dom the DOM element to remove
		 * @returns {HTMLElement} dom
		 */
		this.remove = function remove(dom) {
			var index;
			if (this.has(dom)) {
				index = _childNodes.indexOf(dom);
				_parent.removeChild(dom);
				_childNodes.splice(index, 1);
				return dom;
			} else {
				return false;
			}
		};

		/**
		 * Place a stack by appending its DOM elements to a new parent
		 * @param {HTMLElement} newParentDom the new DOM element to append the stack to
		 * @returns {HTMLElement} newParentDom
		 */
		this.place = function place(newParentDom) {
			if (newParentDom instanceof HTMLElement) {
				[].slice.call(_parent.childNodes).forEach(function (childDom) {
					if (this.has(childDom)) {
						newParentDom.appendChild(childDom);
					}
				}, this);
				return this._setParent(newParentDom);
			} else {
				return false;
			}
		};

		/**
		 * Move an element up in the stack
		 * @param {HTMLElement} dom the dom element to move up
		 * @returns {HTMLElement} dom
		 */
		this.up = function up(dom) {
			if (this.has(dom)) {
				var domPosition = this.getPosition(dom);
				this.move(dom, domPosition + 1);
				return dom;
			} else {
				return false;
			}
		};

		/**
		 * Move an element down in the stack
		 * @param {HTMLElement} dom the dom element to move down
		 * @returns {HTMLElement} dom
		 */
		this.down = function down(dom) {
			if (this.has(dom)) {
				var domPosition = this.getPosition(dom);
				this.move(dom, domPosition - 1);
				return dom;
			} else {
				return false;
			}
		};

		/**
		 * Move an element that is already in the stack to a new position
		 * @param {HTMLElement} dom the dom element to move
		 * @param {Number} position the position to which to move the DOM element
		 * @returns {HTMLElement} dom
		 */
		this.move = function move(dom, position) {
			if (this.has(dom)) {
				var domIndex = _childNodes.indexOf(dom);
				_childNodes.splice(domIndex, 1);
				// Preventing a bug in IE when insertBefore is not given a valid
				// second argument
				var nextElement = getNextElementInDom(position);
				if (nextElement) {
					_parent.insertBefore(dom, nextElement);
				} else {
					_parent.appendChild(dom);
				}
				_childNodes.splice(position, 0, dom);
				return dom;
			} else {
				return false;
			}
		};

		function getNextElementInDom(position) {
			if (position >= _childNodes.length) {
				return;
			}
			var nextElement = _childNodes[position];
			if (Tools.toArray(_parent.childNodes).indexOf(nextElement) == -1) {
				return getNextElementInDom(position +1);
			} else {
				return nextElement;
			}
		}

		/**
		 * Insert a new element at a specific position in the stack
		 * @param {HTMLElement} dom the dom element to insert
		 * @param {Number} position the position to which to insert the DOM element
		 * @returns {HTMLElement} dom
		 */
		this.insert = function insert(dom, position) {
			if (!this.has(dom) && dom instanceof HTMLElement) {
				_childNodes.splice(position, 0, dom);
				_parent.insertBefore(dom, _parent.childNodes[position]);
				return dom;
			} else {
				return false;
			}
		};

		/**
		 * Get the position of an element in the stack
		 * @param {HTMLElement} dom the dom to get the position from
		 * @returns {HTMLElement} dom
		 */
		this.getPosition = function getPosition(dom) {
			return _childNodes.indexOf(dom);
		};

		/**
		 * Count the number of elements in a stack
		 * @returns {Number} the number of items
		 */
		this.count = function count() {
			return _parent.childNodes.length;
		};

		/**
		 * Tells if a DOM element is in the stack
		 * @param {HTMLElement} dom the dom to tell if its in the stack
		 * @returns {HTMLElement} dom
		 */
		this.has = function has(childDom) {
			return this.getPosition(childDom) >= 0;
		};

		/**
		 * Hide a dom element that was previously added to the stack
		 * It will be taken out of the dom until displayed again
		 * @param {HTMLElement} dom the dom to hide
		 * @return {boolean} if dom element is in the stack
		 */
		this.hide = function hide(dom) {
			if (this.has(dom)) {
				_hidePlace.appendChild(dom);
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Show a dom element that was previously hidden
		 * It will be added back to the dom
		 * @param {HTMLElement} dom the dom to show
		 * @return {boolean} if dom element is current hidden
		 */
		this.show = function show(dom) {
			if (this.has(dom) && dom.parentNode === _hidePlace) {
				this.move(dom, _childNodes.indexOf(dom));
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Helper function for hiding all the dom elements
		 */
		this.hideAll = function hideAll() {
			_childNodes.forEach(this.hide, this);
		};

		/**
		 * Helper function for showing all the dom elements
		 */
		this.showAll = function showAll() {
			_childNodes.forEach(this.show, this);
		};

		/**
		 * Get the parent node that a stack is currently attached to
		 * @returns {HTMLElement} parent node
		 */
		this.getParent = function _getParent() {
				return _parent;
		};

		/**
		 * Set the parent element (without appending the stacks dom elements to)
		 * @private
		 */
		this._setParent = function _setParent(parent) {
			if (parent instanceof HTMLElement) {
				_parent = parent;
				return _parent;
			} else {
				return false;
			}
		};

		/**
		 * Get the place where the DOM elements are hidden
		 * @private
		 */
		this.getHidePlace = function getHidePlace() {
			return _hidePlace;
		};

		/**
		 * Set the place where the DOM elements are hidden
		 * @private
		 */
		this.setHidePlace = function setHidePlace(hidePlace) {
			if (hidePlace instanceof HTMLElement) {
				_hidePlace = hidePlace;
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Get the last dom element that the stack transitted to
		 * @returns {HTMLElement} the last dom element
		 */
		this.getLastTransit = function getLastTransit() {
			return _lastTransit;
		};

		/**
		 * Transit between views, will show the new one and hide the previous
		 * element that the stack transitted to, if any.
		 * @param {HTMLElement} dom the element to transit to
		 * @returns {Boolean} false if the element can't be shown
		 */
		this.transit = function transit(dom) {
			if (_lastTransit) {
				this.hide(_lastTransit);
			}
			if (this.show(dom)) {
				_lastTransit = dom;
				return true;
			} else {
				return false;
			}
		};

		this._setParent($parent);

	};

});
