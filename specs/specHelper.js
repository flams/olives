/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

beforeEach(function () {
	this.addMatchers({
		toBeInstanceOf: function(expected) {
			return this.actual instanceof expected;
		}
	});
});