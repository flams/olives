define("Olives/Plugins", 

["Tools"],
		
function Plugins(Tools) {
	
	return function PluginsConstructor() {
		
		var _plugins = {},
			
			applyPlugin = function applyPlugin(phrase, plugin) {
				var couples = phrase.split(",");
				couples.forEach(function (couple) {
					_plugins[plugin] && _plugins[plugin][couple.trim()] && _plugins[plugin][couple.trim()]();
				});
			};
		
		this.add = function add(name, plugin) {
			if (typeof name == "string" && typeof plugin == "object" && plugin) {
				_plugins[name] = plugin;
				return true;
			} else {
				return false;
			}
			
		};
		
		this.get = function get(name) {
			return _plugins[name];
		};
		
		this.del = function del(name) {
			return delete _plugins[name];
		};
		
		this.apply = function apply(dom) {
			
			if (dom instanceof HTMLElement) {
				Tools.toArray(dom.querySelectorAll("*"))
				.map(function (node) {
					Tools.loop(node.dataset, applyPlugin);
				});
				return dom;
			} else {
				return false;
			}
		};
		
	};
});