var fs = require("fs");

function Plugins(obj, pluginsPath) {
	this.fs = fs;
	this.pluginsPath = pluginsPath || "plugins";
	this.plugins = new Object;
	this.obj = obj;
	this.loadedPlugins = 0;
}

Plugins.instance = null;

Plugins.getInstance = function (obj, pluginsPath) {
	if (Plugins.instance == null) {
		if (typeof(pluginsPath) == "undefined") {
			Plugins.instance = new Plugins(obj);	
		}
		else {
			Plugins.instance = new Plugins(obj, pluginsPath);
		}
	}

	return Plugins.instance;
}

Plugins.prototype.loadPlugins = function () {
	var that = this;

	var plugins = this.fs.readdirSync(this.pluginsPath);

	for (var i in plugins) {	
		if (plugins[i].indexOf(".") == 0) {
			continue;
		}
		
		var plugin = plugins[i];
		var stat = that.fs.statSync("./" + that.pluginsPath + "/" + plugin);

		if (!stat.isDirectory()) {
			continue;
		}

		var pStat = that.fs.statSync(that.pluginsPath + "/" + plugin + "/" + plugin + ".js");

		if (!pStat.isFile()) {
			continue;
		}

		var BotPlugin = require("../" + that.pluginsPath + "/" + plugin + "/" + plugin + ".js");
		that.obj.plugins = that.plugins;
		
		var thePlugin = new BotPlugin(that.obj);

		if (!thePlugin.disabled || typeof(thePlugin.disabled) == "undefined") {
			that.plugins[plugin] = thePlugin;
			that.loadedPlugins++;
		}
	}
}

Plugins.prototype.executeCallback = function (cb, params) {
	if (!cb) {
		return false;
	}

	if (this.loadedPlugins < 1) {
		return false;
	}

	for (var pName in this.plugins) {
		var plugin = this.plugins[pName];

		if (plugin[cb] != undefined) {
			if (params != undefined) {
				plugin[cb](params);
			}
			else {
				plugin[cb]();
			}
		}
	}
}

Plugins.prototype.getPlugins = function () {
	return this.plugins;
}

module.exports = Plugins;