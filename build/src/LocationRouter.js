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
        var _watchHandle,

        /**
         * The default route to navigate to when nothing is supplied in the url
         * @private
         */
        _defaultRoute = "",

        /**
         * The last route that was navigated to
         * @private
         */
        _lastRoute = window.location.hash;

        /**
         * Navigates to the current hash or to the default route if none is supplied in the url
         * @private
         */
         /*jshint validthis:true*/
        function doNavigate() {
            if (window.location.hash) {
                var parsedHash = this.parse(window.location.hash);
                this.navigate.apply(this, parsedHash);
            } else {
                this.navigate(_defaultRoute);
            }
        }

        /**
         * Set the default route to navigate to when nothing is defined in the url
         * @param {String} defaultRoute the defaultRoute to navigate to
         * @returns {Boolean} true if it's not an empty string
         */
        this.setDefaultRoute = function setDefaultRoute(defaultRoute) {
            if (defaultRoute && typeof defaultRoute == "string") {
                _defaultRoute = defaultRoute;
                return true;
            } else {
                return false;
            }
        };

        /**
         * Get the currently set default route
         * @returns {String} the default route
         */
        this.getDefaultRoute = function getDefaultRoute() {
            return _defaultRoute;
        };

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
        this.start = function start(defaultRoute) {
            this.setDefaultRoute(defaultRoute);
            doNavigate.call(this);
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
        this.onHashChange  = function onHashChange() {
            if (window.location.hash != _lastRoute) {
                doNavigate.call(this);
            }
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
            _lastRoute = window.location.hash;
        };

        this.getLastRoute = function getLastRoute() {
            return _lastRoute;
        };

    }

    return function LocationRouterFactory() {
        LocationRouterConstructor.prototype = new Router();
        return new LocationRouterConstructor();
    };

});
