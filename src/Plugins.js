define("Olives/Plugins", ["Tools"],
		
/**
 * @class
 * Plugins is the link between the UI and your plugins.
 * You can design your own plugin, declare them in your UI, and call them
 * from the template, like :
 * <tag data-yourPlugin="method: param"></tag>
 * @see Model-Plugin for instance
 * @requires Tools
 */
function Plugins(Tools) {
	
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
		 * @private
		 */
		applyPlugin = function applyPlugin(node, phrase, plugin) {
			phrase.split(";")
			.forEach(function (couple) {
				var split = couple.split(":"),
				method = split[0].trim(),
				params = split[1] ? split[1].split(",").map(trim) : [];
				
				params.unshift(node);

				_plugins[plugin] && _plugins[plugin][method] && _plugins[plugin][method].apply(_plugins[plugin], params);
			});
		};
		
		/**
		 * 
		 * @param name
		 * @param plugin
		 * @returns
		 */
		this.add = function add(name, plugin) {
			if (typeof name == "string" && typeof plugin == "object" && plugin) {
				_plugins[name] = plugin;
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
		 * Apply the plugins to a dom node
		 * @param {HTMLElement} dom the dom node on which to apply the plugins
		 * @returns {Boolean} true if the param is a dom node
		 */
		this.apply = function apply(dom) {
			
			if (dom instanceof HTMLElement) {
				Tools.toArray(dom.querySelectorAll("*"))
				.map(function (node) {
					Tools.loop(node.dataset, function (phrase, plugin) {
						applyPlugin(node, phrase, plugin);
					});
				});
				return dom;
			} else {
				return false;
			}
		};
		
	};
});