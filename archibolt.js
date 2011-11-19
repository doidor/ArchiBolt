var sys = require('sys');
var config = require('./config').config;

if (process.argv.length > 2) {
	var args = process.argv;
	if (args[2] == "-h") {
		console.log("node archibolt.js [<nick>[ <server>]]");
		return;
	}
	else {
		config.user = args[2];
	}

	if (args[3] != undefined) {
		config.host = args[3];
	}
}

var irc = require('./lib/irc');
var fs = require('fs');
var path = require('path');
var repl = require('repl');

var currentUsers = new Object;

var client = new irc.Client(config.host, config.port),
	inChannel = false;

var plugins = require("./lib/plugins.js").getInstance({
	"client" : client,
	"config" : config,
});

plugins.loadPlugins();

sys.puts(sys.inspect(config));

client.connect(config.user);

client.addListener('001', function() {
	this.send('JOIN', config.channel);
});

client.addListener('JOIN', function(prefix) {
	inChannel = true;

	var user = irc.user(prefix);

	plugins.executeCallback("join", user);
});

client.addListener('PART', function(prefix) {
	var user = irc.user(prefix);

	plugins.executeCallback("part", user);
});

client.addListener('DISCONNECT', function() {
	puts('Disconnected, re-connect in 5s');
	setTimeout(function() {
		puts('Trying to connect again ...');

		inChannel = false;
		client.connect(config.user);
		setTimeout(function() {
			if (!inChannel) {
				puts('Re-connect timeout');
				client.disconnect();
				client.emit('DISCONNECT', 'timeout');
			}
		}, 5000);
	}, 5000);

	plugins.executeCallback("disconnect", user);
});


client.addListener('PRIVMSG', function(prefix, channel, text) {
	var user = irc.user(prefix);

	plugins.executeCallback("privmsg", {
		"prefix" : prefix,
		"channel" : channel,
		"text" : text,
		"user" : user
	});
});

repl.start("ArchiBolt> ");
