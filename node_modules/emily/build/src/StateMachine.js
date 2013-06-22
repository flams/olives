/**
 * Emily
 * Copyright(c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 * MIT Licensed
 */
var Tools = require("./Tools");
/**
 * @class
 * Create a stateMachine
 */
     /**
     * @param initState {String} the initial state
     * @param diagram {Object} the diagram that describes the state machine
     * @example
     *
     *      diagram = {
     *              "State1" : [
     *                      [ message1, action, nextState], // Same as the state's add function
     *                      [ message2, action2, nextState]
     *              ],
     *
     *              "State2" :
     *                       [ message3, action3, scope3, nextState]
     *                      ... and so on ....
     *
     *   }
     *
     * @return the stateMachine object
     */
module.exports = function StateMachineConstructor($initState, $diagram) {

        /**
         * The list of states
         * @private
         */
        var _states = {},

        /**
         * The current state
         * @private
         */
        _currentState = "";

        /**
         * Set the initialization state
         * @param {String} name the name of the init state
         * @returns {Boolean}
         */
        this.init = function init(name) {
                if (_states[name]) {
                    _currentState = name;
                    return true;
                } else {
                    return false;
                }
        };

        /**
         * Add a new state
         * @private
         * @param {String} name the name of the state
         * @returns {State} a new state
         */
        this.add = function add(name) {
            if (!_states[name]) {
                var transition = _states[name] = new Transition();
                return transition;
            } else {
                return _states[name];
            }
        };

        /**
         * Get an existing state
         * @private
         * @param {String} name the name of the state
         * @returns {State} the state
         */
        this.get = function get(name) {
            return _states[name];
        };

        /**
         * Get the current state
         * @returns {String}
         */
        this.getCurrent = function getCurrent() {
            return _currentState;
        };

        /**
         * Tell if the state machine has the given state
         * @param {String} state the name of the state
         * @returns {Boolean} true if it has the given state
         */
        this.has = function has(state) {
            return _states.hasOwnProperty(state);
        };

        /**
         * Advances the state machine to a given state
         * @param {String} state the name of the state to advance the state machine to
         * @returns {Boolean} true if it has the given state
         */
        this.advance = function advance(state) {
            if (this.has(state)) {
                _currentState = state;
                return true;
            } else {
                return false;
            }
        };

        /**
         * Pass an event to the state machine
         * @param {String} name the name of the event
         * @returns {Boolean} true if the event exists in the current state
         */
        this.event = function event(name) {
            var nextState;

            nextState = _states[_currentState].event.apply(_states[_currentState].event, Tools.toArray(arguments));
            // False means that there's no such event
            // But undefined means that the state doesn't change
            if (nextState === false) {
                return false;
            } else {
                // There could be no next state, so the current one remains
                if (nextState) {
                    // Call the exit action if any
                    _states[_currentState].event("exit");
                    _currentState = nextState;
                    // Call the new state's entry action if any
                    _states[_currentState].event("entry");
                }
                return true;
            }
        };

        /**
         * Initializes the StateMachine with the given diagram
         */
        Tools.loop($diagram, function (transition, state) {
            var myState = this.add(state);
            transition.forEach(function (params){
                myState.add.apply(null, params);
            });
        }, this);

        /**
         * Sets its initial state
         */
        this.init($initState);
    }

    /**
     * Each state has associated transitions
     * @constructor
     */
    function Transition() {

        /**
         * The list of transitions associated to a state
         * @private
         */
        var _transitions = {};

        /**
         * Add a new transition
         * @private
         * @param {String} event the event that will trigger the transition
         * @param {Function} action the function that is executed
         * @param {Object} scope [optional] the scope in which to execute the action
         * @param {String} next [optional] the name of the state to transit to.
         * @returns {Boolean} true if success, false if the transition already exists
         */
        this.add = function add(event, action, scope, next) {

            var arr = [];

            if (_transitions[event]) {
                return false;
            }

            if (typeof event == "string" &&
                typeof action == "function") {

                    arr[0] = action;

                    if (typeof scope == "object") {
                        arr[1] = scope;
                    }

                    if (typeof scope == "string") {
                        arr[2] = scope;
                    }

                    if (typeof next == "string") {
                        arr[2] = next;
                    }

                    _transitions[event] = arr;
                    return true;
            }

            return false;
        };

        /**
         * Check if a transition can be triggered with given event
         * @private
         * @param {String} event the name of the event
         * @returns {Boolean} true if exists
         */
        this.has = function has(event) {
            return !!_transitions[event];
        };

        /**
         * Get a transition from it's event
         * @private
         * @param {String} event the name of the event
         * @return the transition
         */
        this.get = function get(event) {
            return _transitions[event] || false;
        };

        /**
         * Execute the action associated to the given event
         * @param {String} event the name of the event
         * @param {params} params to pass to the action
         * @private
         * @returns false if error, the next state or undefined if success (that sounds weird)
         */
        this.event = function event(newEvent) {
            var _transition = _transitions[newEvent];
            if (_transition) {
                _transition[0].apply(_transition[1], Tools.toArray(arguments).slice(1));
                return _transition[2];
            } else {
                return false;
            }
        };
    };
