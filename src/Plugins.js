define("Olives/Plugins", ["Tools", "Olives/DomUtils"],
		
/**
 * @class
 * Plugins is the link between the UI and your plugins.
 * You can design your own plugin, declare them in your UI, and call them
 * from the template, like :
 * <tag data-yourPlugin="method: param"></tag>
 * @see Model-Plugin for instance
 * @requires Tools
 */
function Plugins(Tools, DomUtils) {
	
	return function PluginsConstructor() {
		
		/**
		 * The list of plugins
		 * @private
		 */
		var _plugins = {},

		/**
		 * Just a "functionalification" of trim
		 * for code readability
		 * @private
		 */
		trim = function trim(string) {
			return string.trim();
		},
			
		/**
		 * Call the plugins methods, passing them the dom node
		 * A phrase can be :
		 * <tag data-plugin='method: param, param; method:param...'/>
		 * the function has to call every method of the plugin
		 * passing it the node, and the given params
		 * @private
		 */
		applyPlugin = function applyPlugin(node, phrase, plugin) {
			// Split the methods
			phrase.split(";")
			.forEach(function (couple) {
				// Split the result between method and params
				var split = couple.split(":"),
				// Trim the name
				method = split[0].trim(),
				// And the params, if any
				params = split[1] ? split[1].split(",").map(trim) : [];
				
				// The first param must be the dom node
				params.unshift(node);

				if (_plugins[plugin] && _plugins[plugin][method]) {
					// Call the method with the following params for instance :
					// [node, "param1", "param2" .. ]
					_plugins[plugin][method].apply(_plugins[plugin], params);
				}

			});
		};
		
		/**
		 * Add a plugin
		 * @param name
		 * @param plugin
		 * @returns
		 */
		this.add = function add(name, plugin) {
			var that;
			if (typeof name == "string" && typeof plugin == "object" && plugin) {
				_plugins[name] = plugin;
				plugin.getName = function getName () {
					return name;
				};

				that = this;
				plugin.apply = function apply() {
					that.apply.apply(that, arguments);
				};
				return true;
			} else {
				return false;
			}
		};
		
		/**
		 * Get a previously added plugin
		 * @param {String} name the name of the plugin
		 * @returns {Object} the plugin
		 */
		this.get = function get(name) {
			return _plugins[name];
		};
		
		/**
		 * Delete a plugin from the list
		 * @param {String} name the name of the plugin
		 * @returns {Boolean} true if success
		 */
		this.del = function del(name) {
			return delete _plugins[name];
		};
		
		/**
		 * Apply the plugins to a NodeList
		 * @param {HTMLElement} dom the dom nodes on which to apply the plugins
		 * @returns {Boolean} true if the param is a dom node
		 */
		this.apply = function apply(dom) {
			
			var nodes;
			
			if (dom instanceof HTMLElement) {
				
				nodes = DomUtils.getNodes(dom);
				Tools.loop(Tools.toArray(nodes), function (node) {
					Tools.loop(node.dataset, function (phrase, plugin) {
						applyPlugin(node, phrase, plugin);
					});
				});
				
				return true;
				
			} else {
				return false;
			}
		};
		
	};
});