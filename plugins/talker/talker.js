function BotPlugin (obj) {
	this.name = "Talker";
	this.creator = "Tudor Popa";
	this.description = "talk shit";

	this.obj = obj;

	this.client = this.obj.client;
	this.config = this.obj.config;
	this.plugins = this.obj.plugins;

	this.currentUsers = new Object;
}

BotPlugin.prototype.stripUsername = function (text, toStrip) {
	var ret = false;
	if (!(toStrip.indexOf(": ") >= 0)) {
		toStrip += ": ";
	}
	else {
		toStrip = toStrip.substring(0, toStrip.indexOf(": "));
	}

	if (text.indexOf(toStrip) == 0) {
		ret = text.substring(toStrip.length);
	}
	else {
		var pos = text.indexOf(toStrip);
		if (pos > 0) {
		    ret = text.substring(0, pos);

		    if (text[pos - 1] == " ") {
		    	ret = text.substring(0, pos - 1);
		    }
		}
	}

	if (ret) {
		return ret;
	}  
	else {
		return this.stripUsername(text, toStrip);
	}
}

BotPlugin.prototype.privmsg = function (params) {
	var prefix = params.prefix,
		channel = params.channel,
		text = params.text,
		user = params.user;

	if (user == this.config.user) {
		return false;
	}

	if (text.indexOf(this.config.user) >= 0) {
		text = this.stripUsername(text, this.config.user);
	}

	var response = "";

	switch (true) {
		case (text == "hey"):
		case text.indexOf("hello") > -1:
		case text.indexOf("ola") > -1:
		case text.indexOf("hola") > -1:
		case text.indexOf("aloha") > -1:
		case text.indexOf("buenas dias") > -1:
			response = text + " puny insect";
			break;
			
		case text.indexOf("who're you") > -1:
		case text.indexOf("who are you") > -1:
			response = "The name's " + this.config.user + ". I'm an awesome IRC bot created by my master, Tudor Popa.";
			break;

		case text.indexOf("what can you do") > -1:
			var plugin,
				plugins = this.plugins,
				skill;

			response = new Array("I can:");

			for (var i in plugins) {
				plugin = plugins[i];

				if (!plugin.name || !plugin.creator || !plugin.description) {
					continue;
				}

				if (plugin.name == this.name) {
					continue;
				}

				skill = "- " + plugin.description +  " (" + plugin.name + " -- by " + plugin.creator + ")";
				response.push(skill);
			}

			if (response.length < 2) {
				response = "";
			}

			break;
	}

	if (response != "") {
		if (typeof(response) == "object") {
			for (var re in response) {
				this.client.send("PRIVMSG", channel, ":" + user + ": " + response[re]);
			}
		}
		else {
			this.client.send("PRIVMSG", channel, ":" + user + ": " + response);
		}
	}
}

module.exports = BotPlugin;