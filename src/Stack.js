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
		_hidePlace = document.createDocumentFragment(),

		/**
		 * The list of dom elements that are part of the stack
		 * Helps for excluding elements that are not part of it
		 * @private
		 */
		_childNodes = [];

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
				this.move(dom, domPosition-1);
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
				this.move(dom, domPosition+2);
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
				// Preventing a bug in IE when insertBefore is not given a valid
				// second argument
				var nextElement = _parent.childNodes[position];
				if (nextElement) {
					_parent.insertBefore(dom, nextElement);
				} else {
					_parent.appendChild(dom);
				}
				return dom;
			} else {
				return false;
			}
		};

		/**
		 * Insert a new element at a specific position in the stack
		 * @param {HTMLElement} dom the dom element to insert
		 * @param {Number} position the position to which to insert the DOM element
		 * @returns {HTMLElement} dom
		 */
		this.insert = function insert(dom, position) {
			if (!this.has(dom) && dom instanceof HTMLElement) {
				_childNodes.push(dom);
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
			return [].slice.call(_parent.childNodes).indexOf(dom);
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
			return _childNodes.indexOf(childDom) >= 0;
		};

		this.hide = function hide(dom) {
			if (this.has(dom)) {
				_hidePlace.appendChild(dom);
				return true;
			} else {
				return false;
			}
		};

		this.show = function show(dom) {
			if (this.has(dom) && dom.parentNode === _hidePlace) {
				this.move(dom, _childNodes.indexOf(dom));
				return true;
			} else {
				return false;
			}
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
				return _parent = parent;
			} else {
				return false;
			}
		};

		this.getHidePlace = function getHidePlace() {
			return _hidePlace;
		};

		this.setHidePlace = function setHidePlace(hidePlace) {
			if (hidePlace instanceof HTMLElement) {
				_hidePlace = hidePlace;
				return true;
			} else {
				return false;
			}
		};

		this._setParent($parent);

	};

});
