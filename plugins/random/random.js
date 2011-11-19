function BotPlugin (obj) {
	this.name = "RandomGenerator";
	this.creator = "Tudor Popa";
	this.description = "generate random numbers for who wants to get one and decide who got the lowest (aka the loser)";


	this.obj = obj;

	this.client = this.obj.client;
	this.config = this.obj.config;

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
		}
	}

	if (ret) {
		return ret;
	}  
	else {
		return this.stripUsername(text, toStrip);
	}
}

BotPlugin.prototype.findTheLoser = function () {
	var min = 99999;
	var loser = null;
	var where = this.currentUsers;

	for (var i in where) {
		if (where[i] < min) {
			min = where[i];
			loser = i;
		}
	}

	return loser;
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

	if (text.indexOf("random") >= 0) {    
		if (user in this.currentUsers) {
			this.client.send("PRIVMSG", channel, ":" + user + ": Hey dumbass, you wanna cheat?!");
		}
		else {
			var randomN = Math.floor(Math.random() * 101);
			this.currentUsers[user] = randomN;
			this.client.send("PRIVMSG", user, ':Your random number: ' + randomN);
		}
	}

	if (text.indexOf("gogogo") >= 0) {
		var times = 5;
		var that = this;

		this.client.send("PRIVMSG", channel, ":Initiating TEH RANDOM GAIM!");
		this.client.send("PRIVMSG", channel, ":Starting the countdown...");

		var interv = setInterval(function () {
			if (times == 0) {
				var loser = that.findTheLoser();
				var loserMessage = ":The loser is " + loser + " . He only got " + that.currentUsers[loser] + " :))";
				that.client.send("PRIVMSG", channel, loserMessage);
				that.client.send("PRIVMSG", channel, ":Here're the other numbers:");

				for (var i in that.currentUsers) {
					if (i != loser) {
				    	var otherMsg = ":" + i + " -- " + that.currentUsers[i];
				    	that.client.send("PRIVMSG", channel, otherMsg);
				  	}
				}

				that.currentUsers = new Object;
				clearInterval(interv);
				return false;        
			}

			that.client.send("PRIVMSG", channel, ":" + times);
			times--;
		}, 1000);
	}
}

module.exports = BotPlugin;
