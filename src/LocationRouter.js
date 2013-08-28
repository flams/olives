/**
 * Olives http://flams.github.com/olives
 * The MIT License (MIT)
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 */

define(["Router", "Tools"],

/**
 * @class
 * A locationRouter is a router which navigates to the route defined in the URL and updates this URL
 * while navigating. It's a subtype of Emily's Router
 */
function LocationRouter(Router, Tools) {

    "use strict";

    function LocationRouterConstructor() {

        /**
         * The handle on the watch
         * @private
         */
        var _watchHandle;

        /**
         * The function that parses the url to determine the route to navigate to.
         * It has a default behavior explained below, but can be overriden as long as
         * it has the same contract.
         * @param {String} hash the hash coming from window.location.has
         * @returns {Array} has to return an array with the list of arguments to call
         *    navigate with. The first item of the array must be the name of the route.
         *
         * Example: #album/holiday/2013
         *      will navigate to the route "album" and give two arguments "holiday" and "2013"
         */
        this.parse = function parse(hash) {
            return hash.split("#").pop().split("/");
        };

        /**
         * The function that converts, or serialises the route and its arguments to a valid URL.
         * It has a default behavior below, but can be overriden as long as it has the same contract.
         * @param {Array} args the list of arguments to serialize
         * @returns {String} the serialized arguments to add to the url hashmark
         *
         * Example:
         *      ["album", "holiday", "2013"];
         *      will give "album/holiday/2013"
         *
         */
        this.toUrl = function toUrl(args) {
            return args.join("/");
        };

        /**
         * When all the routes and handlers have been defined, start the location router
         * so it parses the URL and navigates to the corresponding route.
         * It will also start listening to route changes and hashmark changes to navigate.
         * While navigating, the hashmark itself will also change to reflect the current route state
         */
        this.start = function start() {
            var parsedHash = this.parse(window.location.hash);
            this.navigate.apply(this, parsedHash);
            this.bindOnHashChange();
            this.bindOnRouteChange();
        };

        /**
         * Remove the events handler for cleaning.
         */
        this.destroy = function destroy() {
            this.unwatch(_watchHandle);
            window.removeEventListener("hashchange", this.boundOnHashChange, true);
        };

        /**
         * Parse the hash and navigate to the corresponding url
         * @private
         */
        this.onHashChange  = function onHashChange(event) {
            var parsedHash = this.parse(event.newUrl.split("#").pop());
            this.navigate.apply(this, parsedHash);
        };

        /**
         * The bound version of onHashChange for add/removeEventListener
         * @private
         */
        this.boundOnHashChange = this.onHashChange.bind(this);

        /**
         * Add an event listener to hashchange to navigate to the corresponding route
         * when it changes
         * @private
         */
        this.bindOnHashChange = function bindOnHashChange() {
            window.addEventListener("hashchange", this.boundOnHashChange, true);
        };

        /**
         * Watch route change events from the router to update the location
         * @private
         */
        this.bindOnRouteChange = function bindOnRouteChange() {
            _watchHandle = this.watch(this.onRouteChange, this);
        };

        /**
         * The handler for when the route changes
         * It updates the location
         * @private
         */
        this.onRouteChange = function onRouteChange() {
            window.location.hash = this.toUrl(Tools.toArray(arguments));
        };

    }

    return function LocationRouterFactory() {
        LocationRouterConstructor.prototype = new Router();
        return new LocationRouterConstructor();
    };

});
