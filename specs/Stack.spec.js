/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

var Stack = require("../src/Stack");

describe("Stack Init", function () {

    var stack = null,
        parentDom = null;

    beforeEach(function () {
        stack = new Stack();
        parentDom = document.createElement("div");
    });

    it("should be a constructor function", function () {
        expect(Stack).toBeInstanceOf(Function);
    });

    it("should have a function to set the Parent element", function () {
        expect(stack._setParent).toBeInstanceOf(Function);
        expect(stack._setParent({})).toBe(false);
        expect(stack._setParent(parentDom)).toBe(parentDom);

        expect(stack.getParent()).toBe(parentDom);
    });

    it("should have a function to get the parent element", function () {
        expect(stack.getParent).toBeInstanceOf(Function);
        expect(stack.getParent().nodeName).toBe("#document-fragment");
    });

    it("can be initialised with a parent element", function () {
        var parent = document.createElement("div"),
            newStack = new Stack(parent);

        expect(newStack.getParent()).toBe(parent);
    });

});

describe("Stack API", function () {

    var stack = null,
        parentDom = null,
        childDom = null;

    beforeEach(function () {
        stack = new Stack();
        parentDom = document.createElement("div");
        childDom = document.createElement("p");

        spyOn(parentDom, "appendChild").andCallThrough();
        spyOn(parentDom, "removeChild").andCallThrough();
        spyOn(parentDom, "insertBefore").andCallThrough();
        stack._setParent(parentDom);
    });

    it("should have a function for adding a DOM element", function () {
        expect(stack.add).toBeInstanceOf(Function);

        expect(stack.add(childDom)).toBe(childDom);

        expect(parentDom.appendChild.wasCalled).toBe(true);
        expect(parentDom.appendChild.mostRecentCall.args[0]).toBe(childDom);
    });

    it("shouldn't add an element that is already in the stack", function () {
        expect(stack.add(childDom)).toBe(childDom);
        expect(stack.add(childDom)).toBe(false);
    });

    it("should have a function for removing a DOM element", function () {
        expect(stack.remove).toBeInstanceOf(Function);
        expect(stack.remove(document.createElement("div"))).toBe(false);

        stack.add(childDom);
        expect(stack.remove(childDom)).toBe(childDom);

        expect(parentDom.removeChild.wasCalled).toBe(true);
        expect(parentDom.removeChild.mostRecentCall.args[0]).toBe(childDom);
    });

    it("should have a function for appending the stack to a parent DOM element", function () {
        expect(stack.place).toBeInstanceOf(Function);
        var newPlace = document.createElement("div");

        expect(stack.place({})).toBe(false);
        expect(stack.place(newPlace)).toBe(newPlace);

        expect(stack.getParent()).toBe(newPlace);
    });

    it("should carry over the dom nodes from the previous place", function () {
        var newPlace = document.createElement("div"),
            dom1 = document.createElement("p"),
            dom2 = document.createElement("p"),
            dom3 = document.createElement("p");

        stack.add(dom1);
        stack.add(dom2);

        // dom3 is not part of the stack, placing the stack somewhere else
        // shouldn't move this one
        parentDom.appendChild(dom3);

        stack.place(newPlace);

        expect(newPlace.childNodes[0]).toBe(dom1);
        expect(newPlace.childNodes[1]).toBe(dom2);
        expect(parentDom.childNodes[0]).toBe(dom3);
    });

    it("should have a function for moving an element up in the stack", function () {
        var dom1 = document.createElement("p"),
            dom2 = document.createElement("a");

        expect(stack.up).toBeInstanceOf(Function);

        expect(stack.up(document.createElement("div"))).toBe(false);
        stack.add(dom1);
        stack.add(dom2);

        expect(stack.up(dom1)).toBe(dom1);

        expect(parentDom.childNodes[0]).toBe(dom2);
        expect(parentDom.childNodes[1]).toBe(dom1);
    });

    it("should have a function for moving an element down in the stack", function () {
        var dom1 = document.createElement("p"),
            dom2 = document.createElement("p");

        expect(stack.down).toBeInstanceOf(Function);

        expect(stack.down(document.createElement("div"))).toBe(false);
        stack.add(dom1);
        stack.add(dom2);

        expect(stack.down(dom2)).toBe(dom2);

        expect(parentDom.childNodes[0]).toBe(dom2);
        expect(parentDom.childNodes[1]).toBe(dom1);
    });

    it("should have a function for moving an element at a specific position in the stack", function () {
        var dom1 = document.createElement("p"),
            dom2 = document.createElement("p");
            dom3 = document.createElement("p");

        expect(stack.move).toBeInstanceOf(Function);
        stack.add(dom1);
        stack.add(dom2);
        stack.add(dom3);

        expect(stack.move(dom3, 1)).toBe(dom3);
        expect(parentDom.childNodes[1]).toBe(dom3);
    });

    it("should have a function for inserting a new element at a specific position in the stack", function () {
        var dom1 = document.createElement("p"),
            dom2 = document.createElement("p");
            dom3 = document.createElement("p");

        expect(stack.insert).toBeInstanceOf(Function);
        stack.add(dom1);
        stack.add(dom3);

        expect(stack.insert(dom2, 1)).toBe(dom2);

        expect(parentDom.childNodes[1]).toBe(dom2);
        expect(stack.getPosition(dom2)).toBe(1);
    });

    it("should have a function for getting the current position in the stack", function () {
        var dom1 = document.createElement("p"),
            dom2 = document.createElement("p");
            dom3 = document.createElement("p");

        expect(stack.getPosition).toBeInstanceOf(Function);
        stack.add(dom1);
        stack.add(dom2);
        stack.add(dom3);

        expect(stack.getPosition(dom3)).toBe(2);
    });

    it("should have a function for getting the length of the stack", function () {
        expect(stack.count).toBeInstanceOf(Function);
        stack.add(document.createElement("div"));
        stack.add(document.createElement("div"));

        expect(stack.count()).toBe(2);
    });

    it("should have a function for telling if a DOM element is in the stack", function () {
        var dom = document.createElement("p");

        expect(stack.has).toBeInstanceOf(Function);
        stack.add(dom);
        expect(stack.has(dom)).toBe(true);
    });

});

describe("Stack Hide and Show", function () {

    var stack = null,
        hidePlace = null,
        parent = null;

    beforeEach(function () {
        stack = new Stack();
        hidePlace = stack.getHidePlace();
        parent = stack.getParent();
    });

    it("has a dom fragment to attach the hidden elements to", function () {
        var dom = document.createElement("div");
        expect(stack.getHidePlace().nodeName).toBe("DIV");
        expect(stack.setHidePlace()).toBe(false);
        expect(stack.setHidePlace(dom)).toBe(true);
        expect(stack.getHidePlace()).toBe(dom);
    });

    it("has a function for hiding an element in the stack", function () {
        var dom1 = document.createElement("div");

        stack.add(dom1);

        expect(stack.hide()).toBe(false);
        expect(stack.hide({})).toBe(false);

        spyOn(hidePlace, "appendChild");

        expect(stack.hide(dom1)).toBe(true);

        expect(hidePlace.appendChild.wasCalled).toBe(true);
        expect(hidePlace.appendChild.mostRecentCall.args[0]).toBe(dom1);
    });

    it("has a function for showing an element that was previously hidden", function () {
        var dom1 = document.createElement("div");

        stack.add(dom1);

        expect(stack.show()).toBe(false);
        expect(stack.show({})).toBe(false);
        expect(stack.show(dom1)).toBe(false);
        stack.hide(dom1);

        spyOn(parent, "appendChild");

        expect(stack.show(dom1)).toBe(true);

        expect(parent.appendChild.wasCalled).toBe(true);
        expect(parent.appendChild.mostRecentCall.args[0]).toBe(dom1);
    });

    it("shows back the dom element at the place it was before", function () {
        var dom1 = document.createElement("div"),
            dom2 = document.createElement("p"),
            dom3 = document.createElement("ul");

        stack.add(dom1);
        stack.add(dom2);
        stack.add(dom3);

        stack.hide(dom2);
        stack.show(dom2);

        expect(parent.childNodes[0]).toBe(dom1);
        expect(parent.childNodes[1]).toBe(dom2);
        expect(parent.childNodes[2]).toBe(dom3);
    });

    it("can hide all the dom elements at once", function () {
        var dom1 = document.createElement("div"),
            dom2 = document.createElement("p"),
            dom3 = document.createElement("ul");

        stack.add(dom1);
        stack.add(dom2);
        stack.add(dom3);

        spyOn(stack, "hide");

        stack.hideAll();

        expect(stack.hide.callCount).toBe(3);
        expect(stack.hide.calls[0].args[0]).toBe(dom1);
        expect(stack.hide.calls[1].args[0]).toBe(dom2);
        expect(stack.hide.calls[2].args[0]).toBe(dom3);
        expect(stack.hide.mostRecentCall.object).toBe(stack);
    });

    it("can show all the dom elements at once", function () {
        var dom1 = document.createElement("div"),
            dom2 = document.createElement("p"),
            dom3 = document.createElement("ul");

        stack.add(dom1);
        stack.add(dom2);
        stack.add(dom3);

        spyOn(stack, "show");

        stack.hideAll();
        stack.showAll();

        expect(stack.show.callCount).toBe(3);
        expect(stack.show.calls[0].args[0]).toBe(dom1);
        expect(stack.show.calls[1].args[0]).toBe(dom2);
        expect(stack.show.calls[2].args[0]).toBe(dom3);
        expect(stack.show.mostRecentCall.object).toBe(stack);
    });

    it("can show an element even if the next one is hidden", function () {
        var dom1 = document.createElement("div"),
            dom2 = document.createElement("p"),
            dom3 = document.createElement("ul"),
            place = document.createElement("div");

        stack.add(dom1);
        stack.add(dom2);
        stack.add(dom3);

        stack.place(place);

        stack.hideAll();

        expect(function () {
            stack.show(dom1);
        }).not.toThrow();

        expect(place.childNodes[0]).toBe(dom1);

        expect(function () {
            stack.show(dom3);
        }).not.toThrow();

        expect(place.childNodes[1]).toBe(dom3);

        expect(function () {
            stack.show(dom2);
        }).not.toThrow();

        expect(place.childNodes[1]).toBe(dom2);

    });

    it("can transit between the new view and the previously displayed", function() {
        var dom1 = document.createElement("div"),
            dom2 = document.createElement("div"),
            dom3 = document.createElement("div"),
            place = document.createElement("div");

        stack.add(dom1);
        stack.add(dom2);
        stack.add(dom3);

        stack.place(place);

        stack.hide(dom2);
        stack.hide(dom3);

        expect(stack.getLastTransit()).toBe(null);

        stack.transit(dom2);

        expect(stack.getLastTransit()).toBe(dom2);

        expect(place.childNodes[0]).toBe(dom1);
        expect(place.childNodes[1]).toBe(dom2);

        stack.transit(dom3);

        expect(stack.getLastTransit()).toBe(dom3);

        expect(place.childNodes[0]).toBe(dom1);
        expect(place.childNodes[1]).toBe(dom3);

        expect(stack.transit(document.createElement("div"))).toBe(false);

        expect(stack.getLastTransit()).toBe(dom3);
    });
});