/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */
beforeEach(function () {
	this.addMatchers({
		toBeInstanceOf: function(expected) {
			return this.actual instanceof expected;
		}
	});
});
